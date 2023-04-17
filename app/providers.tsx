// https://github.com/nextui-org/nextui/issues/849#issuecomment-1304872506
"use client";

import { useServerInsertedHTML } from "next/navigation";
import { CssBaseline } from "@nextui-org/react";
import { NextUIProvider } from "@nextui-org/react";
import { useState, useEffect, Fragment } from "react";

export default function Providers({ children }: { children: React.ReactNode }, { ...delegated }) {
	useServerInsertedHTML(() => {
		return <>{CssBaseline.flush()}</>;
	});

	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) return null;

	return (
		<Fragment {...delegated}>
			<NextUIProvider>{children}</NextUIProvider>
		</Fragment>
	);
}
