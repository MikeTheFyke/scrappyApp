import Product from "@/lib/models/product.model";
import { generateEmailBody } from "@/lib/nodemailer";

import { scrapeAmazonProduct } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose";
import { sendEmail } from "../../../lib/nodemailer/index";
import {
	getAveragePrice,
	getEmailNotifType,
	getHighestPrice,
	getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
	try {
		connectToDB();

		const products = await Product.find({});

		if (!products) throw new Error("No products found");

		const updatedProducts = await Promise.all(
			products.map(async (currentProduct) => {
				const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

				if (!scrapedProduct) return;

				// Rescrape all products & update DB

				const updatedPriceHistory: any = [
					...currentProduct.priceHistory,
					{ price: scrapedProduct.currentPrice },
				];

				const product = {
					...scrapedProduct,
					priceHistory: updatedPriceHistory,
					lowestPrice: getLowestPrice(updatedPriceHistory),
					highestPrice: getHighestPrice(updatedPriceHistory),
					averagePrice: getAveragePrice(updatedPriceHistory),
					reviewsCount: scrapedProduct.reviewsCount,
					stars: scrapedProduct.stars,
					isOutOfStock: scrapedProduct.isOutOfStock,
				};

				const updatedProduct = await Product.findOneAndUpdate(
					{ url: product.url },
					product
				);

				// Check each products status & send email

				const emailNotifType = getEmailNotifType(
					scrapedProduct,
					currentProduct
				);

				if (emailNotifType && updatedProduct.users.length > 0) {
					const productInfo = {
						title: updatedProduct.title,
						url: updatedProduct.url,
					};

					const emailContent = await generateEmailBody(
						productInfo,
						emailNotifType
					);

					const userEmails = updatedProduct.users.map(
						(user: any) => user.email
					);

					await sendEmail(emailContent, userEmails);
				}
				return updatedProduct;
			})
		);

		return NextResponse.json({
			message: "OK",
			data: updatedProducts,
		});
	} catch (error) {
		throw new Error(`Error in GET: ${error}`);
	}
}
