import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, LineChart, Map, Users, TrendingUp, HelpCircle, Phone, BookOpen } from "lucide-react";

// Dummy data for charts and map (replace with real API data as needed)
const priceForecast = [
	{ year: 2025, price: 25 },
	{ year: 2027, price: 40 },
	{ year: 2030, price: 70 },
	{ year: 2035, price: 120 },
];
const supplyDemand = [
	{ year: 2025, supply: 10000, demand: 12000 },
	{ year: 2027, supply: 18000, demand: 22000 },
	{ year: 2030, supply: 35000, demand: 40000 },
	{ year: 2035, supply: 80000, demand: 90000 },
];

const innovationProjects = [
	{
		name: "Sand to Green (Morocco)",
		summary: "Agroforestry & solar-powered desalination to fight desertification and build food security.",
		impact: "Restored desertified land, created jobs, improved food security.",
		cobenefits: ["Water conservation", "Job creation", "Soil restoration"],
	},
	{
		name: "Octavia DAC (Kenya)",
		summary: "Direct Air Carbon Capture using geothermal energy for cost-effective carbon removal.",
		impact: "First DAC in Africa, local manufacturing, job creation.",
		cobenefits: ["Tech innovation", "Renewable energy", "Climate leadership"],
	},
	{
		name: "Farm to Feed (Africa)",
		summary: "Reduces food waste, increases farmer income, and avoids landfill emissions.",
		impact: "Lowered GHG emissions, improved food security, higher farmer earnings.",
		cobenefits: ["Food security", "GHG reduction", "Income boost"],
	},
];

const faqs = [
	{
		q: "How much can I earn from carbon credits?",
		a: "Depending on your practices and region, you can earn $15–$50 per ton of CO₂ sequestered annually. Premium projects can fetch even higher prices as the market grows.",
	},
	{
		q: "What practices qualify for carbon credits?",
		a: "Practices like no-till, cover cropping, agroforestry, composting, and crop rotation are eligible. See the full list in the onboarding guide.",
	},
	{
		q: "How long does it take to get paid?",
		a: "After verification, payment is typically issued within 4–8 weeks. Real-time status is available in your dashboard.",
	},
	{
		q: "Do I need to change all my farming practices?",
		a: "No, you can start with a few climate-smart practices and scale up over time. The platform supports both beginners and advanced users.",
	},
];

const successStories = [
	{
		name: "John Kimani",
		region: "Kiambu, Kenya",
		quote: "The carbon program transformed my farm. Not only am I earning more, but my soil is healthier and my crops are more resilient to droughts.",
		stats: "+42% income, +2.1% soil carbon",
	},
	{
		name: "Sarah Nalwoga",
		region: "Bugiri, Uganda",
		quote: "First female farmer in my district to reach 20+ tons total credits sold. My yields and income have never been better!",
		stats: "+35% income, +12.3 tons CO₂e/year",
	},
];

function Forecast() {
	// Calculator state
	const [farmSize, setFarmSize] = useState(5);
	const [region, setRegion] = useState("Kenya");
	const [practice, setPractice] = useState("Agroforestry");
	// Simple calculator logic (replace with real API)
	const pricePerTon = 30;
	const tons = farmSize * (practice === "Agroforestry" ? 4 : practice === "No-till" ? 1 : 0.7);
	const revenue = tons * pricePerTon;

	return (
		<div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
			{/* Sidebar placeholder */}
			<aside className="hidden md:block w-64 bg-white/80 border-r p-6">
				<nav className="space-y-4">
					<div className="font-bold text-lg mb-4">Forecast Menu</div>
					<a href="#hero" className="block hover:text-green-700">Overview</a>
					<a href="#forecast" className="block hover:text-green-700">Price Forecast</a>
					<a href="#simulator" className="block hover:text-green-700">Calculator</a>
					<a href="#innovation" className="block hover:text-green-700">Innovation</a>
					<a href="#mrv" className="block hover:text-green-700">MRV Timeline</a>
					<a href="#map" className="block hover:text-green-700">Opportunity Map</a>
					<a href="#stories" className="block hover:text-green-700">Success Stories</a>
					<a href="#faq" className="block hover:text-green-700">FAQ</a>
				</nav>
			</aside>
			<main className="flex-1 p-4 md:p-10 space-y-10">
				{/* Hero Section */}
				<section id="hero" className="rounded-xl bg-gradient-to-r from-green-200 to-blue-200 shadow-lg p-8 flex flex-col md:flex-row items-center gap-8">
					<div className="flex-1">
						<h1 className="text-3xl md:text-5xl font-bold mb-2 text-green-900">Africa’s Carbon Future</h1>
						<p className="text-lg md:text-2xl text-green-800 mb-4">Forecast & Market Insights for Farmers and Investors</p>
						<div className="flex gap-6 mt-4">
							<div className="flex items-center gap-2"><TrendingUp className="text-green-700" /> <span className="font-bold">$80–$150/ton</span> <span className="text-xs">by 2035</span></div>
							<div className="flex items-center gap-2"><Users className="text-green-700" /> <span className="font-bold">+85M</span> <span className="text-xs">jobs by 2035</span></div>
							<div className="flex items-center gap-2"><AreaChart className="text-green-700" /> <span className="font-bold">20x–40x</span> <span className="text-xs">market growth</span></div>
						</div>
					</div>
					<div className="flex-1 flex justify-center">
						{/* Placeholder for animated Africa map */}
						<div className="w-64 h-64 bg-gradient-to-br from-green-300 to-blue-300 rounded-full shadow-inner flex items-center justify-center">
							<Map className="w-32 h-32 text-green-800 opacity-70" />
						</div>
					</div>
				</section>

				{/* Price Forecast & Analytics */}
				<section id="forecast" className="grid md:grid-cols-2 gap-8">
					<Card>
						<CardHeader>
							<CardTitle>Carbon Price Forecast</CardTitle>
						</CardHeader>
						<CardContent>
							{/* Simple line chart mockup */}
							<div className="h-48 flex items-end gap-4">
								{priceForecast.map((d, i) => (
									<div key={d.year} className="flex flex-col items-center">
										<div className="bg-green-500 rounded-t w-8" style={{ height: `${d.price / 2}px` }}></div>
										<span className="text-xs mt-1">{d.year}</span>
									</div>
								))}
							</div>
							<div className="text-sm text-gray-600 mt-2">Projected price per ton (USD)</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Supply & Demand Analytics</CardTitle>
						</CardHeader>
						<CardContent>
							{/* Simple area chart mockup */}
							<div className="h-48 flex items-end gap-4">
								{supplyDemand.map((d, i) => (
									<div key={d.year} className="flex flex-col items-center">
										<div className="bg-blue-400 rounded-t w-6" style={{ height: `${d.supply / 1000}px` }}></div>
										<div className="bg-green-400 rounded-t w-6 mt-1" style={{ height: `${d.demand / 1000}px` }}></div>
										<span className="text-xs mt-1">{d.year}</span>
									</div>
								))}
							</div>
							<div className="text-xs text-gray-600 mt-2">Blue: Supply, Green: Demand (in 1,000s)</div>
						</CardContent>
					</Card>
				</section>

				{/* Marketplace Simulator */}
				<section id="simulator">
					<Card className="bg-white/90">
						<CardHeader>
							<CardTitle>Marketplace Simulator</CardTitle>
							<div className="text-sm text-gray-600">Estimate your potential credits and revenue</div>
						</CardHeader>
						<CardContent>
							<form className="flex flex-col md:flex-row gap-4 items-end">
								<div>
									<label className="block text-xs font-semibold mb-1">Farm Size (hectares)</label>
									<Input type="number" min={0.5} max={1000} value={farmSize} onChange={e => setFarmSize(Number(e.target.value))} className="w-32" />
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">Region</label>
									<select value={region} onChange={e => setRegion(e.target.value)} className="w-32 border rounded px-2 py-1">
										<option>Kenya</option>
										<option>Uganda</option>
										<option>Tanzania</option>
										<option>Ghana</option>
									</select>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">Practice</label>
									<select value={practice} onChange={e => setPractice(e.target.value)} className="w-32 border rounded px-2 py-1">
										<option>Agroforestry</option>
										<option>No-till</option>
										<option>Cover cropping</option>
									</select>
								</div>
								<Button type="button" className="bg-green-600 hover:bg-green-700 text-white">Calculate</Button>
							</form>
							<div className="mt-4 flex gap-8">
								<div className="text-lg font-bold text-green-800">Estimated Credits: <span className="text-2xl">{tons.toFixed(1)}</span></div>
								<div className="text-lg font-bold text-blue-800">Estimated Revenue: <span className="text-2xl">${revenue.toLocaleString()}</span></div>
							</div>
						</CardContent>
					</Card>
				</section>

				{/* Innovation Highlights */}
				<section id="innovation">
					<h2 className="text-2xl font-bold mb-4">Innovation Highlights</h2>
					<div className="grid md:grid-cols-3 gap-6">
						{innovationProjects.map((proj) => (
							<Card key={proj.name} className="bg-gradient-to-br from-green-100 to-blue-100 border-green-200">
								<CardHeader>
									<CardTitle>{proj.name}</CardTitle>
									<div className="text-xs text-gray-600 mb-2">{proj.summary}</div>
								</CardHeader>
								<CardContent>
									<div className="mb-2 text-green-900 font-semibold">Impact:</div>
									<div className="mb-2 text-sm">{proj.impact}</div>
									<div className="flex flex-wrap gap-2 mt-2">
										{proj.cobenefits.map(cb => (
											<span key={cb} className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs">{cb}</span>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* MRV & Verification Timeline */}
				<section id="mrv">
					<h2 className="text-2xl font-bold mb-4">MRV & Verification Timeline</h2>
					<div className="flex flex-col md:flex-row gap-6 items-center">
						<div className="flex-1 flex flex-row md:flex-col gap-4 md:gap-8 justify-between">
							<div className="flex flex-col items-center">
								<BookOpen className="w-8 h-8 text-green-700 mb-1" />
								<span className="text-xs font-semibold">Registration</span>
							</div>
							<div className="flex flex-col items-center">
								<AreaChart className="w-8 h-8 text-blue-700 mb-1" />
								<span className="text-xs font-semibold">Baseline</span>
							</div>
							<div className="flex flex-col items-center">
								<TrendingUp className="w-8 h-8 text-green-700 mb-1" />
								<span className="text-xs font-semibold">Monitoring</span>
							</div>
							<div className="flex flex-col items-center">
								<Users className="w-8 h-8 text-blue-700 mb-1" />
								<span className="text-xs font-semibold">Verification</span>
							</div>
							<div className="flex flex-col items-center">
								<HelpCircle className="w-8 h-8 text-green-700 mb-1" />
								<span className="text-xs font-semibold">Issuance</span>
							</div>
						</div>
						<div className="flex-1">
							<ol className="list-decimal ml-6 text-sm text-gray-700">
								<li>Register farm and practices</li>
								<li>Baseline assessment (soil, biomass, remote sensing)</li>
								<li>Ongoing monitoring (satellite, field, modeling)</li>
								<li>Third-party verification & audit</li>
								<li>Credit issuance & payment</li>
							</ol>
							<div className="text-xs text-gray-500 mt-2">Typical timeline: 4–8 weeks from registration to payment</div>
						</div>
					</div>
				</section>

				{/* Regional Opportunity Map (placeholder) */}
				<section id="map">
					<h2 className="text-2xl font-bold mb-4">Regional Opportunity Map</h2>
					<div className="w-full h-64 bg-gradient-to-br from-green-200 to-blue-200 rounded-xl flex items-center justify-center">
						<span className="text-green-900 font-bold text-lg">[Interactive Africa Map Coming Soon]</span>
					</div>
				</section>

				{/* Success Stories Carousel */}
				<section id="stories">
					<h2 className="text-2xl font-bold mb-4">Farmer Success Stories</h2>
					<div className="flex gap-6 overflow-x-auto pb-4">
						{successStories.map((story) => (
							<Card key={story.name} className="min-w-[300px] bg-white/90 border-green-200">
								<CardHeader>
									<CardTitle>{story.name}</CardTitle>
									<div className="text-xs text-gray-600 mb-2">{story.region}</div>
								</CardHeader>
								<CardContent>
									<blockquote className="italic text-green-900 mb-2">“{story.quote}”</blockquote>
									<div className="text-xs text-blue-800 font-semibold">{story.stats}</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* FAQ & Learning Pathways */}
				<section id="faq">
					<h2 className="text-2xl font-bold mb-4">FAQ & Learning Pathways</h2>
					<Accordion type="single" collapsible className="mb-6">
						{faqs.map((faq, i) => (
							<AccordionItem key={i} value={String(i)}>
								<AccordionTrigger>{faq.q}</AccordionTrigger>
								<AccordionContent>{faq.a}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
					<Tabs defaultValue="beginner">
						<TabsList>
							<TabsTrigger value="beginner">Beginner Pathway</TabsTrigger>
							<TabsTrigger value="advanced">Advanced Pathway</TabsTrigger>
						</TabsList>
						<TabsContent value="beginner">
							<ul className="list-disc ml-6 text-sm">
								<li>Using the Mobile App (Week 1–2)</li>
								<li>Cover Crop Management (Week 3–6)</li>
								<li>Composting for Carbon (Week 7–9)</li>
								<li>Setting Up No-Till Farming (Week 10–15)</li>
							</ul>
						</TabsContent>
						<TabsContent value="advanced">
							<ul className="list-disc ml-6 text-sm">
								<li>Soil Health Monitoring (Month 1)</li>
								<li>Agroforestry System Design (Month 2–3)</li>
								<li>Advanced Integration Techniques (Month 4–5)</li>
								<li>Business Planning & Marketing (Month 6)</li>
							</ul>
						</TabsContent>
					</Tabs>
				</section>

				{/* Support & Contact Widget */}
				<div className="fixed bottom-6 right-6 z-50">
					<Card className="bg-green-700 text-white shadow-xl">
						<CardContent className="flex items-center gap-4 p-4">
							<Phone className="w-6 h-6" />
							<div>
								<div className="font-bold">24/7 Farmer Hotline</div>
								<div className="text-xs">+254-700-CARBON | WhatsApp | SMS: HELP to 29429</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}

export default Forecast;
