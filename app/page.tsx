"use client";

import { useState, useEffect, useRef } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Text, Input, Image, Grid, Card, Row, Spacer, Button } from "@nextui-org/react";

import { prominent, average } from "color.js";

const REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+(?:png|jpg|jpeg|gif|svg)+$/i;

export default function HomePage() {
	const [imageURL, setImageURL] = useState<string>("");
	const [uploadedImage, setUploadedImage] = useState<boolean>(false);
	const [colorsCJS, setColorsCJS] = useState<string[]>([]);
	const [colorsCJSAvg, setColorsCJSAvg] = useState<string>("");

	const fileRef = useRef<HTMLInputElement>(null);

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

	const handleUploadButton = () => {
		fileRef.current?.click();
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) {
			return;
		}
		setUploadedImage(true);
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (e) => {
			setImageURL(e.target?.result as string);
		};
	};

	return (
		<NextUIProvider>
			<div className="main">
				{imageURL ? <div className="image-container"><img className="image" src={imageURL}></img></div> : null}
					<Grid.Container gap={1} justify="center" css={{ maxWidth: "75vw" }}>
						{colorsCJS.map((hexColor, index) => (
							<Grid xs={4} sm={2} md={2} lg={1} key={index} justify="center">
								<Card isPressable isHoverable variant="bordered">
									<Card.Body css={{ backgroundColor: hexColor, paddingBottom: "50px" }} />
									<Card.Footer
										isBlurred
										css={{
											justifyItems: "center",
											borderBlockStart: "inherit",
										}}
									>
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
				<Button.Group>
					<Button onClick={handleUploadButton}>Upload Image</Button>
					<input hidden ref={fileRef} type="file" accept=".png, .jpg, .jpeg" onChange={handleFileUpload} />
					<Button
						animated={false}
						disabled={!uploadedImage}
						onClick={() => {
							setUploadedImage(!uploadedImage);
							setImageURL("");
							if (fileRef.current) fileRef.current.value = "";
						}}
					>
						x
					</Button>
				</Button.Group>
				<Input type={"url"} clearable underlined placeholder="Image from URL" onChange={(e) => updateImageURL(e.target.value)}></Input>
				{/* <Text>Test: '{imageURL}'</Text>
				<Text>Test2: '{uploadedImage.valueOf()}'</Text>
				{colorsCJS.length ? <Text>Palette: {colorsCJS.join(", ")}</Text> : null}
				{colorsCJSAvg ? <Text>Average: {colorsCJSAvg}</Text> : null} */}
			</div>
		</NextUIProvider>
	);
}
