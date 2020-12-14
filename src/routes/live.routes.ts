import { Application } from "express";
const fetch = require("node-fetch");

export default (app: Application): void => {
	app.post("/credit-search", async (req, res, next) => {
		console.log("credit search route");
		const { surname, address, postcode } = req.body;
		console.log(surname, address, postcode);

		// fetch address id from address endpoint
		const addressUrl =
			"https://developer-test-service-2vfxwolfiq-nw.a.run.app/addresses";

		const addressBody = {
			address1: address,
			address2: "",
			postcode: postcode,
		};

		const addressOptions = {
			method: "post",
			body: JSON.stringify(addressBody),
			headers: { "Content-Type": "application/json" },
		};

		const response = await fetch(addressUrl, addressOptions);
		if (response.ok) {
			const address = await response.json();
			const addressId = await address[0].id;
			console.log(addressId);
		}

		// fetch creditors

		res.status(200).send();
		next();
	});
};
