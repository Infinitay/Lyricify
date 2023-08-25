// https://github.com/nextui-org/nextui/issues/849#issuecomment-1304872506
"use client";

import { useServerInsertedHTML } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { useState, useEffect, Fragment } from "react";

export default function Providers({ children }: { children: React.ReactNode }, { ...delegated }) {
	return (
			<NextUIProvider>{children}</NextUIProvider>
	);
}
