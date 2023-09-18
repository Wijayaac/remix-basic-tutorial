import { cssBundleHref } from "@remix-run/css-bundle"
import {
	Form,
	Links,
	LiveReload,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useNavigation
} from "@remix-run/react"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { LinksFunction, redirect } from "@remix-run/node"

// existing imports
import { createEmptyContact, getContacts } from "./data"

import appStylesHref from './app.css'
import { json } from "@remix-run/node"

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: appStylesHref },
	...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const q = url.searchParams.get("q")
	const contacts = await getContacts(q)
	return json({ contacts })
}



export const action = async () => {
	const contact = await createEmptyContact()
	return redirect(`/contacts/${contact.id}/edit`)
}

export default function Root() {
	const { contacts } = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<div id="sidebar">
					<h1>Remix Contacts</h1>
					<div>
						<Form id="search-form" role="search">
							<input
								aria-label="Search contacts"
								id="q"
								name="q"
								placeholder="Search"
								type="search"
							/>
							<div
								aria-hidden
								hidden={true}
								id="search-spinner"
							/>
						</Form>
						<Form method="post">
							<button type="submit">New</button>
						</Form>
					</div>
					<nav>
						{contacts?.length ? (
							<ul>
								{contacts.map((contact) => (
									<li key={contact.id}>
										<NavLink to={`contacts/${contact.id}`}
											className={({ isActive, isPending }) =>
												isActive ? "active" : isPending ? "pending" : ""}>
											{contact.first || contact.last ? (
												<>
													{contact.first} {contact.last}
												</>
											) : (
												<i>No Name</i>
											)}{" "}
											{contact.favorite ? (
												<span>★</span>
											) : null}
										</NavLink>
									</li>
								))}
							</ul>
						) : (
							<p>
								<i>No contacts</i>
							</p>
						)}
					</nav>
				</div>
				<div id="detail" className={navigation.state === "loading" ? "loading" : ""}>
					<Outlet />
				</div>

				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
