import React from "react";
import Image from "next/image";

const Home = () => {
	return (
		<>
			<section className="px-6 md:px-20 py-24 border-2 border-red-500">
				<div className="flex mx-xl:flex-col gap-16">
					<div className="flex flex-col justify-center">
						<p className="small-text">
							Shopping Starts Here:
							<Image
								src="/assets/icons/arrow-right.svg"
								alt="arrow-right"
								width={16}
								height={16}
							/>
						</p>
						<h1 className="head-text">
							Unleash the Power of
							<span className="text-primary"> ScrappyApp</span>
						</h1>
						<p className="mt-6">
							Powerful, self-serve product and growth analytics to help you
							convert, engage and retain more.
						</p>
					</div>
				</div>
			</section>
		</>
	);
};

export default Home;
