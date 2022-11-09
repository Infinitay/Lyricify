// https://github.com/nextui-org/nextui/issues/849#issuecomment-1304872506
"use client";

import { useServerInsertedHTML } from "next/navigation";
import { CssBaseline } from "@nextui-org/react";
import { NextUIProvider } from "@nextui-org/react";

export default function Providers({ children }: { children: React.ReactNode }) {
	useServerInsertedHTML(() => {
		return <>{CssBaseline.flush()}</>;
	});

	return (
		<>
			<NextUIProvider>{children}</NextUIProvider>
		</>
	);
}
