import { Application } from "express";
import { stringify } from "querystring";
const fetch = require("node-fetch");

export default (app: Application): void => {
	app.post("/credit-search", async (req, res, next) => {
		const { surname, address, postcode } = req.body;
		let address1;
		let address2;
		// split address if it contains 'flat'
		if (address.toLowerCase().includes("flat")) {
			address1 = address.split(" ").slice(0, 2).join(" ");

			address2 = address
				.split(" ")
				.slice(2, address.split(" ").length)
				.join(" ");
		} else {
			address1 = address;
			address2 = "";
		}

		const addressUrl =
			"https://developer-test-service-2vfxwolfiq-nw.a.run.app/addresses";

		const addressBody = {
			address1: address1,
			address2: address2,
			postcode: postcode,
		};

		const addressOptions = {
			method: "post",
			body: JSON.stringify(addressBody),
			headers: { "Content-Type": "application/json" },
		};

		// fetch address id from address endpoint
		const creditorData = await fetch(addressUrl, addressOptions)
			.then((response) => {
				return response.json();
			})
			.then((jsonResponse) => {
				const addressId = jsonResponse[0].id;

				// fetch creditors
				const creditorsUrl =
					"https://developer-test-service-2vfxwolfiq-nw.a.run.app/creditors";

				const creditorsBody = {
					surname: surname,
					addressId: addressId,
				};

				const creditorsOptions = {
					method: "post",
					body: JSON.stringify(creditorsBody),
					headers: { "Content-Type": "application/json" },
				};

				return fetch(creditorsUrl, creditorsOptions)
					.then((response) => {
						return response.json();
					})
					.then((jsonResponse) => {
						let totalCreditors = 0;
						let securedCreditors = 0;
						let unsecureCreditors = 0;
						let qualifies = false;
						let unsecuredCount = 0;

						jsonResponse.forEach((creditor) => {
							totalCreditors += creditor.value;
							if (creditor.secured) {
								securedCreditors += creditor.value;
							} else {
								unsecureCreditors += creditor.value;
								unsecuredCount++;
							}
						});
						// set value for qualifies
						console.log(unsecuredCount, unsecureCreditors);
						if (
							unsecuredCount >= 1 &&
							unsecureCreditors >= 500000
						) {
							qualifies = true;
						}

						const result = {
							totalCreditorValue: totalCreditors,
							securedCreditorValue: securedCreditors,
							unsecuredCreditorValue: unsecureCreditors,
							qualifies: qualifies,
						};
						return result;
					});
			});

		res.status(200).json(creditorData);
	});
};
