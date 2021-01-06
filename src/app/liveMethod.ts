import { Request, Response, Application } from "express";
const fetch = require("node-fetch");

export default async (req: Request, res: Response): Promise<void> => {
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

	const addressResponse = await fetch(addressUrl, addressOptions);
	const addressJSON = await addressResponse.json();
	const addressId = addressJSON[0].id;

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

	const creditorsResponse = await fetch(creditorsUrl, creditorsOptions);
	const creditorsJSON = await creditorsResponse.json();

	const parseCreditors = (creditors) => {
		const result = {
			totalCreditorValue: creditors.reduce((prev, creditor) => {
				return prev + creditor.value;
			}, 0),
			securedCreditorValue: creditors
				.filter((creditor) => {
					return creditor.secured;
				})
				.reduce((prev, creditor) => {
					return prev + creditor.value;
				}, 0),
			unsecuredCreditorValue: creditors
				.filter((creditor) => {
					return !creditor.secured;
				})
				.reduce((prev, creditor) => {
					return prev + creditor.value;
				}, 0),
			qualifies: false,
		};

		if (
			creditors.filter((creditor) => {
				return !creditor.secured;
			}).length > 1 &&
			result.unsecuredCreditorValue > 500000
		) {
			result.qualifies = true;
		}
		return result;
	};

	res.send(parseCreditors(creditorsJSON));
};
