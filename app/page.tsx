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

	const fileUploadInputRef = useRef<HTMLInputElement>(null);
	const urlInputRef = useRef<HTMLInputElement>(null);
	const mainDivRef = useRef<HTMLDivElement>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);

	const hasFileUploaded: boolean = !!fileUploadInputRef.current?.files?.length;

	const updateImageFile = (file: File) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (e) => {
			setImageURL(e.target?.result as string);
			setUploadedImage(true);
		};
	};

	const updateImageURL = (url: string) => {
		if (url === "") {
			if (hasFileUploaded) {
				const file = fileUploadInputRef?.current?.files?.[0];
				if (!file) return;
				updateImageFile(file);
			} else {
				setImageURL("");
				if (mainDivRef.current) mainDivRef.current.style.backgroundColor = "";
			}
		} else if (REGEX.test(url)) {
			// If url matches REGEX, set imageURL to url
			setImageURL(url);
		}
	};

	useEffect(() => {
		const getColorsCJS = async () => {
			if (imageURL) {
				const colors = (await prominent(imageURL, { format: "hex", amount: 5, group: 30 })) as [];
				const avg = (await average(imageURL, { format: "hex" })) as "";
				setColorsCJS([...colors, avg]);
				setColorsCJSAvg(avg);
			} else {
				setColorsCJS([]);
				setColorsCJSAvg("");
			}
		};
		getColorsCJS();
	}, [imageURL]);

	const handleUploadButton = () => {
		fileUploadInputRef.current?.click();
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) {
			return;
		}
		const file = e.target.files[0];
		updateImageFile(file);
	};

	const handleClearFileUpload = () => {
		setUploadedImage(!uploadedImage);
		updateImageURL("");
		if (fileUploadInputRef.current) fileUploadInputRef.current.value = "";
		// In case there is a URL specified, go ahead and just reload that instead
		updateImageURL(urlInputRef.current?.value as string);
	};

	const handleColorClick = (hexColor: string) => {
		console.log(`Clicked on ${hexColor}`);
		navigator.clipboard.writeText(hexColor);
		if (mainDivRef.current) mainDivRef.current.style.backgroundColor = hexColor;
	};

	return (
		<NextUIProvider>
			<div ref={mainDivRef} className="main">
				{imageURL ? (
					<>
						<div ref={imageContainerRef} className="image-container">
							<img className="image" src={imageURL}></img>
						</div>
						<Spacer y={2}></Spacer>
						<Grid.Container gap={1} justify="center" css={{ maxWidth: "75vw" }}>
							{colorsCJS.map((hexColor, index) => (
								<Grid xs={4} sm={2} md={2} lg={1} key={index} justify="center">
									<Card isPressable isHoverable variant="bordered" onClick={() => handleColorClick(hexColor)}>
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
						<Spacer y={1}></Spacer>
					</>
				) : null}
				<Button.Group>
					<Button onClick={handleUploadButton}>Upload Image</Button>
					<input ref={fileUploadInputRef} hidden type="file" accept=".png, .jpg, .jpeg" onChange={handleFileUpload} />
					<Button animated={false} disabled={!uploadedImage} onClick={handleClearFileUpload}>
						x
					</Button>
				</Button.Group>
				<Spacer y={0.5}></Spacer>
				<Input ref={urlInputRef} type={"url"} clearable placeholder="Image from URL" onChange={(e) => updateImageURL(e.target.value)}></Input>
			</div>
		</NextUIProvider>
	);
}
