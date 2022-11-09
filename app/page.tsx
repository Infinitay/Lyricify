"use client";

import { useState, useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Text, Input, Image, Grid, Card, Row, Spacer } from "@nextui-org/react";

import { prominent, average } from "color.js";

const REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+(?:png|jpg|jpeg|gif|svg)+$/i;

export default function HomePage() {
	const [imageURL, setImageURL] = useState<string>("");
	const [colorsCJS, setColorsCJS] = useState<string[]>([]);
	const [colorsCJSAvg, setColorsCJSAvg] = useState<string>("");

	const updateImageURL = (url: string) => {
		// If url matches REGEX, set imageURL to url
		if (REGEX.test(url)) {
			setImageURL(url);
		}
	};

	useEffect(() => {
		const getColorsCJS = async () => {
			console.log("CJS");
			if (imageURL) {
				const colors = (await prominent(imageURL, { format: "hex", amount: 6, group: 30 })) as [];
				console.log(colors);
				const avg = (await average(imageURL, { format: "hex" })) as "";
				console.log(avg);
				setColorsCJS(colors);
				setColorsCJSAvg(avg);
			} else {
				setColorsCJS([]);
				setColorsCJSAvg("");
			}
		};
		getColorsCJS();
	}, [imageURL]);

	return (
		<NextUIProvider>
			<div className="main">
				<Image src={imageURL} width={"50vw"} height={"50vh"}></Image>
				<Grid.Container gap={1} justify="center" css={{maxWidth: "75vw"}}>
					{colorsCJS.map((hexColor, index) => (
						<Grid xs={4} sm={2} md={2} lg={1} key={index} justify="center">
							<Card isPressable isHoverable>
								<Card.Body css={{ background: hexColor, paddingBottom: "50px" }} />
								<Card.Footer css={{ justifyItems: "center" }}>
									<Row wrap="wrap" justify="center">
										<Text css={{ minWidth: "max-content" }} b>
											{hexColor}
										</Text>
									</Row>
								</Card.Footer>
							</Card>
						</Grid>
					))}
				</Grid.Container>
				<input type={"file"}></input>
				<Input type={"url"} clearable underlined onChange={(e) => updateImageURL(e.target.value)}></Input>
				<Text>Test: '{imageURL}'</Text>
				{colorsCJS.length ? <Text>Palette: {colorsCJS.join(", ")}</Text> : null}
				{colorsCJSAvg ? <Text>Average: {colorsCJSAvg}</Text> : null}
			</div>
		</NextUIProvider>
	);
}
