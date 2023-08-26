"use client";

import { useState, useEffect, useRef } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Input, Card, CardBody, CardFooter, Spacer, Button, ButtonGroup, Link } from "@nextui-org/react";

import { prominent, average } from "color.js";

import { toBlob } from "html-to-image";

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
	const downloadButtonRef = useRef<HTMLButtonElement>(null);

	const hasFileUploaded: boolean = !!fileUploadInputRef.current?.files?.length;
	const [isReady, setIsReady] = useState<boolean>(false);
	const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);

	const updateImageFile = (file: File) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (e) => {
			setImageURL(e.target?.result as string);
			setUploadedImage(true);
			if (urlInputRef.current) urlInputRef.current.value = "";
		};
	};

	const updateImageURL = (url: string) => {
		console.log("updateImageURL: " + url);
		if (url === "") {
			if (uploadedImage) {
				console.log("updateImageURL: hasFileUploaded");
				if (fileUploadInputRef.current) fileUploadInputRef.current.value = "";
			}
			setImageURL("");
			if (mainDivRef.current) mainDivRef.current.style.setProperty("--main-bg-color", `#ffffff`);
		} else if (REGEX.test(url)) {
			// If url matches REGEX, set imageURL to url
			if (uploadedImage) {
				console.log("updateImageURL: hasFileUploaded and URL matches REGEX");
				if (fileUploadInputRef.current) fileUploadInputRef.current.value = "";
				setUploadedImage(false);
			}
			setImageURL(url);
		}
	};

	useEffect(() => {
		console.log("useEffect imageURL");
		setIsReady(false);
		const getColorsCJS = async () => {
			if (imageURL) {
				const colors = (await prominent(imageURL, { format: "hex", amount: 5, group: 30 })) as string[];
				const avg = (await average(imageURL, { format: "hex" })) as "";
				setColorsCJS([...colors, avg]);
				setColorsCJSAvg(avg);
				setSelectedColor(colors[0]!);
			} else {
				setColorsCJS([]);
				setColorsCJSAvg("");
				setSelectedColor("");
			}
		};
		getColorsCJS();
	}, [imageURL]);

	useEffect(() => {
		console.log("useEffect selectedColor");
		if (mainDivRef.current) {
			const selectedColorRGB = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(selectedColor);
			if (!selectedColorRGB) return;
			const selectedColorRBGString = `${parseInt(selectedColorRGB[1], 16)}, ${parseInt(selectedColorRGB[2], 16)}, ${parseInt(selectedColorRGB[3], 16)}`;
			mainDivRef.current.style.setProperty("--main-bg-color", `${selectedColorRBGString}`);
			divToBlob();
			setIsReady(true);
		} else {
			setIsReady(false);
		}
	}, [selectedColor]);

	useEffect(() => {
		divToBlob();
	}, [isReady, imageURL]);

	const divToBlob = () => {
		const divElement = imageContainerRef.current;
		if (divElement) {
			toBlob(divElement, {}).then((blob) => {
				if (blob) {
					setDownloadBlob(blob);
				}
			});
		}
	};

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
		setUploadedImage(false);
		updateImageURL("");
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
			<div ref={mainDivRef} className="main pt-10">
				{imageURL && isReady ? (
					<>
						<div ref={imageContainerRef} className={`image-container`} style={{ color: selectedColor }}>
							<img id="image" className="image" src={imageURL}></img>
							<div className="image-border-fade pointer-events-none" style={{ color: selectedColor }}></div>
						</div>
						<Spacer y={5}></Spacer>
						<Button
							ref={downloadButtonRef}
							as={Link}
							href={downloadBlob ? URL.createObjectURL(downloadBlob) : ""}
							target="_blank"
							download={downloadBlob ? `lyricify-${selectedColor.substring(1)}.png` : ""}
							color="default"
							showAnchorIcon
						>
							Download
						</Button>
						<Spacer y={5}></Spacer>
						<div className="hex-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 justify-center" style={{ maxWidth: "75vw" }}>
							{!!colorsCJS.length &&
								colorsCJS.map((hexColor, index) => (
									<Card
										style={{ backgroundColor: hexColor }}
										shadow="none"
										className="shadow-md hover:shadow-xl drop-shadow-sm hover:drop-shadow-md"
										isPressable
										isHoverable
										onClick={() => handleColorClick(hexColor)}
									>
										<CardBody className="h-16" style={{ backgroundColor: hexColor }} />
										<CardFooter className="max-h-12 flex items-center justify-center border-t bg-white hover:bg-slate-100 ">
											<div className="p-2 text-center w-full">
												<p className="min-w-max w-20 font-bold">{hexColor}</p>
											</div>
										</CardFooter>
									</Card>
								))}
						</div>
						<Spacer y={4}></Spacer>
					</>
				) : null}
				<div className="flex flex-col justify-center items-center m-h-[20vh] pb-10">
					<ButtonGroup fullWidth={true}>
						<Button className="w-4/5" fullWidth={true} color="primary" onClick={handleUploadButton}>
							{uploadedImage ? "Change Image" : "Upload Image"}
						</Button>
						<input ref={fileUploadInputRef} hidden type="file" accept=".png, .jpg, .jpeg" onChange={handleFileUpload} />
						<Button
							className="min-w-0 w-1/5"
							fullWidth={false}
							disableAnimation={false}
							isDisabled={!uploadedImage}
							onClick={handleClearFileUpload}
						>
							x
						</Button>
					</ButtonGroup>
					<Spacer y={4}></Spacer>
					<Input
						fullWidth={false}
						ref={urlInputRef}
						type={"url"}
						isClearable
						placeholder="Image from URL"
						onChange={(e) => updateImageURL(e.target.value)}
					></Input>
				</div>
			</div>
		</NextUIProvider>
	);
}
