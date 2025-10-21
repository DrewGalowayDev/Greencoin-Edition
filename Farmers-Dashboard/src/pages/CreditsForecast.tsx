import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, LineChart, Map, Users, TrendingUp, HelpCircle, Phone, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

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

export default function CreditsForecast() {
  // Calculator state
  const [farmSize, setFarmSize] = useState(5);
  const [region, setRegion] = useState("Kenya");
  const [practice, setPractice] = useState("Agroforestry");
  
  // Simple calculator logic (replace with real API)
  const pricePerTon = 30;
  const tons = farmSize * (practice === "Agroforestry" ? 4 : practice === "No-till" ? 1 : 0.7);
  const revenue = tons * pricePerTon;

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-4 md:p-6 space-y-8">
          {/* Hero Section */}
          <section id="hero" className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg p-8 border">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold mb-2 text-foreground">Africa's Carbon Future</h1>
                <p className="text-lg md:text-2xl text-muted-foreground mb-4">Forecast & Market Insights for Farmers and Investors</p>
                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-primary h-5 w-5" />
                    <span className="font-bold text-foreground">$80–$150/ton</span>
                    <span className="text-xs text-muted-foreground">by 2035</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-primary h-5 w-5" />
                    <span className="font-bold text-foreground">+85M</span>
                    <span className="text-xs text-muted-foreground">jobs by 2035</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AreaChart className="text-primary h-5 w-5" />
                    <span className="font-bold text-foreground">20x–40x</span>
                    <span className="text-xs text-muted-foreground">market growth</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full shadow-inner flex items-center justify-center border">
                  <Map className="w-32 h-32 text-primary opacity-70" />
                </div>
              </div>
            </div>
          </section>

          {/* Price Forecast & Analytics */}
          <section id="forecast" className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carbon Price Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-4 justify-center">
                  {priceForecast.map((d, i) => (
                    <div key={d.year} className="flex flex-col items-center">
                      <div className="bg-primary rounded-t w-8 transition-all hover:bg-primary/80" style={{ height: `${d.price / 2}px` }}></div>
                      <span className="text-xs mt-1 text-muted-foreground">{d.year}</span>
                      <span className="text-xs font-semibold text-foreground">${d.price}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-2 text-center">Projected price per ton (USD)</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Supply & Demand Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-4 justify-center">
                  {supplyDemand.map((d, i) => (
                    <div key={d.year} className="flex flex-col items-center">
                      <div className="bg-secondary rounded-t w-6" style={{ height: `${d.supply / 1000}px` }}></div>
                      <div className="bg-primary rounded-t w-6 mt-1" style={{ height: `${d.demand / 1000}px` }}></div>
                      <span className="text-xs mt-1 text-muted-foreground">{d.year}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  <span className="inline-block w-3 h-3 bg-secondary rounded mr-1"></span>Supply, 
                  <span className="inline-block w-3 h-3 bg-primary rounded mr-1 ml-2"></span>Demand (in 1,000s)
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Marketplace Simulator */}
          <section id="simulator">
            <Card>
              <CardHeader>
                <CardTitle>Marketplace Simulator</CardTitle>
                <div className="text-sm text-muted-foreground">Estimate your potential credits and revenue</div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Farm Size (hectares)</label>
                    <Input 
                      type="number" 
                      min={0.5} 
                      max={1000} 
                      value={farmSize} 
                      onChange={e => setFarmSize(Number(e.target.value))} 
                      className="w-32" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Region</label>
                    <select 
                      value={region} 
                      onChange={e => setRegion(e.target.value)} 
                      className="w-32 h-10 border border-input bg-background px-3 py-2 text-sm rounded-md"
                    >
                      <option>Kenya</option>
                      <option>Uganda</option>
                      <option>Tanzania</option>
                      <option>Ghana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Practice</label>
                    <select 
                      value={practice} 
                      onChange={e => setPractice(e.target.value)} 
                      className="w-32 h-10 border border-input bg-background px-3 py-2 text-sm rounded-md"
                    >
                      <option>Agroforestry</option>
                      <option>No-till</option>
                      <option>Cover cropping</option>
                    </select>
                  </div>
                  <Button type="button">Calculate</Button>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="text-lg font-bold text-primary">
                    Estimated Credits: <span className="text-2xl">{tons.toFixed(1)}</span>
                  </div>
                  <div className="text-lg font-bold text-secondary">
                    Estimated Revenue: <span className="text-2xl">${revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Innovation Highlights */}
          <section id="innovation">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Innovation Highlights</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {innovationProjects.map((proj) => (
                <Card key={proj.name} className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">{proj.name}</CardTitle>
                    <div className="text-xs text-muted-foreground mb-2">{proj.summary}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-foreground font-semibold">Impact:</div>
                    <div className="mb-2 text-sm text-muted-foreground">{proj.impact}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proj.cobenefits.map(cb => (
                        <span key={cb} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs border border-primary/20">
                          {cb}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* MRV & Verification Timeline */}
          <section id="mrv">
            <h2 className="text-2xl font-bold mb-4 text-foreground">MRV & Verification Timeline</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 flex flex-row md:flex-col gap-4 md:gap-8 justify-between">
                    <div className="flex flex-col items-center">
                      <BookOpen className="w-8 h-8 text-primary mb-1" />
                      <span className="text-xs font-semibold text-foreground">Registration</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <AreaChart className="w-8 h-8 text-secondary mb-1" />
                      <span className="text-xs font-semibold text-foreground">Baseline</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <TrendingUp className="w-8 h-8 text-primary mb-1" />
                      <span className="text-xs font-semibold text-foreground">Monitoring</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Users className="w-8 h-8 text-secondary mb-1" />
                      <span className="text-xs font-semibold text-foreground">Verification</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <HelpCircle className="w-8 h-8 text-primary mb-1" />
                      <span className="text-xs font-semibold text-foreground">Issuance</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <ol className="list-decimal ml-6 text-sm text-muted-foreground space-y-1">
                      <li>Register farm and practices</li>
                      <li>Baseline assessment (soil, biomass, remote sensing)</li>
                      <li>Ongoing monitoring (satellite, field, modeling)</li>
                      <li>Third-party verification & audit</li>
                      <li>Credit issuance & payment</li>
                    </ol>
                    <div className="text-xs text-muted-foreground mt-2">
                      Typical timeline: 4–8 weeks from registration to payment
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Regional Opportunity Map */}
          <section id="map">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Regional Opportunity Map</h2>
            <Card>
              <CardContent className="p-6">
                <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center border border-border">
                  <span className="text-foreground font-bold text-lg">[Interactive Africa Map Coming Soon]</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Success Stories */}
          <section id="stories">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Farmer Success Stories</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {successStories.map((story) => (
                <Card key={story.name} className="min-w-[300px] flex-shrink-0">
                  <CardHeader>
                    <CardTitle className="text-lg">{story.name}</CardTitle>
                    <div className="text-xs text-muted-foreground mb-2">{story.region}</div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="italic text-foreground mb-2">"{story.quote}"</blockquote>
                    <div className="text-xs text-primary font-semibold">{story.stats}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ & Learning Pathways */}
          <section id="faq">
            <h2 className="text-2xl font-bold mb-4 text-foreground">FAQ & Learning Pathways</h2>
            <div className="space-y-6">
              <Accordion type="single" collapsible>
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={String(i)}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <Tabs defaultValue="beginner" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="beginner">Beginner Pathway</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Pathway</TabsTrigger>
                </TabsList>
                <TabsContent value="beginner">
                  <Card>
                    <CardContent className="p-4">
                      <ul className="list-disc ml-6 text-sm text-muted-foreground space-y-1">
                        <li>Using the Mobile App (Week 1–2)</li>
                        <li>Cover Crop Management (Week 3–6)</li>
                        <li>Composting for Carbon (Week 7–9)</li>
                        <li>Setting Up No-Till Farming (Week 10–15)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="advanced">
                  <Card>
                    <CardContent className="p-4">
                      <ul className="list-disc ml-6 text-sm text-muted-foreground space-y-1">
                        <li>Soil Health Monitoring (Month 1)</li>
                        <li>Agroforestry System Design (Month 2–3)</li>
                        <li>Advanced Integration Techniques (Month 4–5)</li>
                        <li>Business Planning & Marketing (Month 6)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        {/* Support & Contact Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="bg-primary text-primary-foreground shadow-xl border-primary">
            <CardContent className="flex items-center gap-4 p-4">
              <Phone className="w-6 h-6" />
              <div>
                <div className="font-bold">24/7 Farmer Hotline</div>
                <div className="text-xs opacity-90">+254-700-CARBON | WhatsApp | SMS: HELP to 29429</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
