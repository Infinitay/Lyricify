"use client";

import { useState, useEffect, useRef } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Text, Input, Grid, Card, Row, Spacer, Button } from "@nextui-org/react";

import { prominent, average } from "color.js";

const REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+(?:png|jpg|jpeg|gif|svg)+$/i;

export default function HomePage() {
	const [imageURL, setImageURL] = useState<string>("");
	const [uploadedImage, setUploadedImage] = useState<boolean>(false);
	const [colorsCJS, setColorsCJS] = useState<string[]>([]);
	const [colorsCJSAvg, setColorsCJSAvg] = useState<string>("");
	const [selectedColor, setSelectedColor] = useState<string>("");

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
		console.log("updateImageURL: " + url);
		if (url === "") {
			if (hasFileUploaded) {
				console.log("updateImageURL: hasFileUploaded");
				const file = fileUploadInputRef?.current?.files?.[0];
				if (!file) return;
				updateImageFile(file);
			} else {
				console.log("updateImageURL: !hasFileUploaded");
				setImageURL("");
				if (mainDivRef.current) mainDivRef.current.style.backgroundColor = "";
			}
		} else if (REGEX.test(url)) {
			console.log("updateImageURL: REGEX.test(url)");
			// If url matches REGEX, set imageURL to url
			setImageURL(url);
		}
	};

	useEffect(() => {
		const getColorsCJS = async () => {
			console.log("useEffect");
			if (imageURL) {
				const colors = (await prominent(imageURL, { format: "hex", amount: 5, group: 30 })) as string[];
				const avg = (await average(imageURL, { format: "hex" })) as "";
				setColorsCJS([...colors, avg]);
				setColorsCJSAvg(avg);
				setSelectedColor(colors[0]!);
				/* if (selectedColor && mainDivRef.current) {
					mainDivRef.current.style.backgroundColor = selectedColor;
				} */
			} else {
				setColorsCJS([]);
				setColorsCJSAvg("");
				setSelectedColor("");
			}
		};
		getColorsCJS();
	}, [imageURL]);

	useEffect(() => {
		if (mainDivRef.current) {
			const selectedColorRGB = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(selectedColor);
			if (!selectedColorRGB) return;
			const selectedColorRBGString = `${parseInt(selectedColorRGB[1], 16)}, ${parseInt(selectedColorRGB[2], 16)}, ${parseInt(selectedColorRGB[3], 16)}`;
			mainDivRef.current.style.setProperty("--main-bg-color", `${selectedColorRBGString}`);
			console.log(selectedColorRGB);
			console.log(selectedColorRBGString);
			//mainDivRef.current.style.backgroundColor = selectedColor;
			// if (imageContainerRef.current) imageContainerRef.current.style.setProperty("--tw-shadow-color", colorsCJSAvg);
		}
	}, [selectedColor]);

	const handleUploadButton = () => {
		console.log("handleUploadButton");
		fileUploadInputRef.current?.click();
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("handleFileUpload");
		if (!e.target.files || e.target.files.length === 0) {
			return;
		}
		const file = e.target.files[0];
		updateImageFile(file);
	};

	const handleClearFileUpload = () => {
		console.log("handleClearFileUpload");
		setUploadedImage(!uploadedImage);
		updateImageURL((urlInputRef.current?.value as string) || "");
		if (fileUploadInputRef.current) fileUploadInputRef.current.value = "";
		// In case there is a URL specified, go ahead and just reload that instead
	};

	const handleColorClick = (hexColor: string) => {
		console.log(`Clicked on ${hexColor}`);
		try {
			navigator.clipboard.writeText(hexColor);
		} finally {
			setSelectedColor(hexColor);
		}
	};

	return (
		<NextUIProvider>
			<div ref={mainDivRef} className="main">
				{imageURL ? (
					<>
						<div
							ref={imageContainerRef}
							className={`image-container`}
							style={{ color: selectedColor }}
						>
							<img id="image" className="image" src={imageURL}></img>
							<div className="image-border-fade pointer-events-none" style={{ color: selectedColor }}></div>
						</div>
						<Spacer y={2}></Spacer>
						<Grid.Container gap={1} justify="center" css={{ maxWidth: "75vw" }}>
							{colorsCJS.length &&
								colorsCJS.map((hexColor, index) => (
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
