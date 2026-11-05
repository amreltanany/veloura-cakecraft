import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Wheat,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import bakeryHero from "@/assets/bakery-hero.jpg";
import chocolateCake from "@/assets/chocolate-ganache.jpg";
import lemonCake from "@/assets/lemon-elderflower.jpg";
import strawberryCake from "@/assets/strawberry-shortcake.jpg";

type Cake = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  label: string;
};

type CartItem = Cake & { quantity: number; details?: string };
type DialogView = "cart" | "builder" | "checkout" | "complete";

const cakes: Cake[] = [
  {
    id: "strawberry-shortcake",
    name: "Strawberry cloud cake",
    description: "Vanilla sponge, soft cream & ripe berries.",
    price: 46,
    image: strawberryCake,
    label: "A little seasonal",
  },
  {
    id: "chocolate-ganache",
    name: "Chocolate garden cake",
    description: "Deep cocoa, silky ganache & raspberries.",
    price: 52,
    image: chocolateCake,
    label: "A chocolate lover’s",
  },
  {
    id: "lemon-elderflower",
    name: "Lemon & elderflower",
    description: "Bright lemon curd, elderflower & soft vanilla.",
    price: 48,
    image: lemonCake,
    label: "A fresh favorite",
  },
];

const sizes = [
  { name: '6" · serves 6–8', price: 38 },
  { name: '8" · serves 10–14', price: 54 },
  { name: '10" · serves 18–22', price: 72 },
];

const cakeChoices = {
  sponge: ["Vanilla bean", "Chocolate", "Lemon"],
  filling: ["Strawberry compote", "Chocolate ganache", "Lemon curd"],
  frosting: ["Whipped vanilla", "Dark chocolate", "Swiss meringue"],
  finish: ["Seasonal fruit", "Petal piping", "Classic smooth"],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VÈLÔURÁ — Cakes & Bakes" },
      {
        name: "description",
        content: "Small-batch celebration cakes, baked slowly and finished by hand. Find a favorite or make it your own.",
      },
      { property: "og:title", content: "VÈLÔURÁ — Cakes & Bakes" },
      {
        property: "og:description",
        content: "Small-batch celebration cakes, baked slowly and finished by hand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BakeryStorefront,
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function BakeryStorefront() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogView, setDialogView] = useState<DialogView>("cart");
  const [size, setSize] = useState(sizes[1]?.name ?? '8" · serves 10–14');
  const [sponge, setSponge] = useState(cakeChoices.sponge[0] ?? "Vanilla bean");
  const [filling, setFilling] = useState(cakeChoices.filling[0] ?? "Strawberry compote");
  const [frosting, setFrosting] = useState(cakeChoices.frosting[0] ?? "Whipped vanilla");
  const [finish, setFinish] = useState(cakeChoices.finish[0] ?? "Seasonal fruit");
  const [inscription, setInscription] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const customPrice = sizes.find((option) => option.name === size)?.price ?? 54;
  const customDescription = `${size} · ${sponge} sponge · ${filling} · ${frosting} · ${finish}${inscription.trim() ? ` · “${inscription.trim()}”` : ""}${pickupDate ? ` · pickup ${pickupDate}` : ""}`;

  const lenis = useSmoothScroll();
  // Pause smooth scroll while the bag dialog is open so the page behind it stays put.
  useEffect(() => {
    if (dialogOpen) lenis.current?.stop();
    else lenis.current?.start();
  }, [dialogOpen, lenis]);

  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis.current) lenis.current.scrollTo(target, { offset: -16 });
    else target.scrollIntoView({ behavior: "smooth" });
  }

  const summary = useMemo(() => cart.map(({ id, name, details, quantity }) => ({ id, name, details, quantity })), [cart]);

  function addCake(cake: Cake) {
    setCart((current) => {
      const existing = current.find((item) => item.id === cake.id);
      if (existing) {
        return current.map((item) => item.id === cake.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...cake, quantity: 1 }];
    });
    setDialogView("cart");
    setDialogOpen(true);
  }

  function addCustomCake() {
    const customCake: CartItem = {
      id: `custom-${Date.now()}`,
      name: "Your made-to-order cake",
      description: "Made just the way you like it.",
      price: customPrice,
      image: bakeryHero,
      label: "Made for you",
      quantity: 1,
      details: customDescription,
    };
    setCart((current) => [...current, customCake]);
    setDialogView("cart");
    setDialogOpen(true);
  }

  function changeQuantity(id: string, amount: number) {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialogView("complete");
    setCart([]);
  }

  function openCart() {
    setDialogView("cart");
    setDialogOpen(true);
  }

  function ChoiceGroup({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: string[];
    value: string;
    onChange: (option: string) => void;
  }) {
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option}
              type="button"
              variant={value === option ? "default" : "outline"}
              size="sm"
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className="rounded-sm"
            >
              {option}
            </Button>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="flex min-h-9 items-center justify-center gap-2 bg-accent px-4 py-2 text-center text-xs font-medium text-accent-foreground sm:text-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Small-batch cakes, baked fresh for your best days
      </div>

      <header className="relative z-10 border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <a href="#home" className="group flex shrink-0 items-center gap-2" aria-label="VÈLÔURÁ home">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <Wheat className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-xl font-semibold">VÈLÔURÁ</span>
              <span className="mt-1 hidden text-[10px] font-medium uppercase text-muted-foreground min-[360px]:block">A little neighborhood bakery</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Main navigation">
            <a href="#cakes" className="transition-colors hover:text-primary">The cake table</a>
            <a href="#custom" className="transition-colors hover:text-primary">Make it yours</a>
            <a href="#our-way" className="transition-colors hover:text-primary">Our way</a>
          </nav>

          <Button onClick={openCart} variant="outline" className="relative shrink-0 rounded-sm px-3" aria-label={`Open bag, ${cartCount} items`}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Your bag</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">{cartCount}</span>
          </Button>
        </div>
      </header>

      <section id="home" className="mx-auto grid max-w-7xl items-center gap-9 px-5 pb-14 pt-8 md:grid-cols-[0.82fr_1.18fr] md:gap-12 md:px-10 md:pb-20 md:pt-12">
        <div className="order-2 max-w-xl pb-4 md:order-1 md:pb-0">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
            <span className="h-px w-8 bg-primary" /> Made from scratch, with feeling
          </p>
          <h1 className="max-w-lg font-display text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">
            A little cake for <em className="text-primary">a big moment.</em>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            Thoughtful layers, seasonal ingredients, and the kind of finishing touch that makes it yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-sm px-6">
              <a href="#cakes">Find your cake <ArrowRight aria-hidden="true" /></a>
            </Button>
            <Button variant="ghost" size="lg" className="rounded-sm px-4" onClick={() => scrollToSection("custom")}>
              Make it yours <ArrowDown aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-accent-foreground" aria-hidden="true" /> Real, seasonal ingredients</span>
            <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-primary" aria-hidden="true" /> Made by hand, always</span>
          </div>
        </div>
        <div className="relative order-1 overflow-hidden rounded-sm md:order-2">
          <img src={bakeryHero} alt="Fresh strawberry layer cake finished with berries and cream" width={1600} height={1000} fetchPriority="high" data-parallax className="aspect-[1.35/1] w-full object-cover md:aspect-[1.18/1]" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-background/95 px-4 py-3 shadow-sm sm:bottom-6 sm:left-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
            <span><span className="block font-display text-lg leading-tight">The little celebration cake</span><span className="text-xs text-muted-foreground">Our strawberry-season favorite</span></span>
          </div>
        </div>
      </section>

      <section id="cakes" className="border-y border-border bg-secondary/40 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-primary">From our cake table</p>
              <h2 className="font-display text-4xl font-medium sm:text-5xl">Made to be remembered.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">A few of the bakes we love most. Every one is finished by hand, just for you.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cakes.map((cake) => (
              <article key={cake.id} data-reveal className="group overflow-hidden border border-border bg-card">
                <div className="relative overflow-hidden">
                  <img src={cake.image} alt={cake.name} width={1024} height={1024} loading="lazy" className="aspect-[1.14/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                  <span className="absolute left-3 top-3 bg-background/95 px-3 py-1.5 text-xs font-medium">{cake.label}</span>
                  <span className="absolute bottom-3 right-3 bg-background px-3 py-1.5 text-sm font-semibold">{formatPrice(cake.price)}</span>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-medium">{cake.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{cake.description}</p>
                  </div>
                  <Button onClick={() => addCake(cake)} size="sm" variant="outline" className="shrink-0 rounded-sm">Add to bag <Plus aria-hidden="true" /></Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-right text-xs text-muted-foreground">Sample prices shown in USD.</p>
        </div>
      </section>

      <section id="custom" className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 md:grid-cols-[1fr_0.9fr] md:gap-16 md:px-10 md:py-20">
        <div data-reveal className="relative overflow-hidden rounded-sm">
          <img src={lemonCake} alt="Lemon and elderflower cake decorated with fresh citrus and tiny flowers" width={1024} height={1024} loading="lazy" className="aspect-[1.25/1] w-full object-cover" />
          <span className="absolute bottom-4 left-4 bg-background/95 px-3 py-2 text-xs font-medium">Every detail, your call</span>
        </div>
        <div data-reveal className="max-w-lg">
          <p className="mb-3 text-xs font-semibold uppercase text-primary">The best part? You make the rules.</p>
          <h2 className="font-display text-4xl font-medium leading-tight sm:text-5xl">Your cake, your kind of lovely.</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Pick your sponge, filling and finish. Add a little message and a pickup day. We’ll bake it fresh, just for your table.</p>
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            {[
              "Three sizes, made for sharing",
              "Choose your favorite flavors",
              "Hand-finished just for you",
              "Add a note for your moment",
            ].map((detail) => <li key={detail} className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-accent-foreground" aria-hidden="true" />{detail}</li>)}
          </ul>
          <Button onClick={() => { setDialogView("builder"); setDialogOpen(true); }} size="lg" className="mt-8 rounded-sm px-6">Build your cake <ArrowRight aria-hidden="true" /></Button>
        </div>
      </section>

      <section id="our-way" className="border-y border-border bg-accent/45 py-12 md:py-16">
        <div data-reveal className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 md:px-10">
          <div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background text-primary"><Wheat className="h-5 w-5" aria-hidden="true" /></span><div><h3 className="font-display text-xl">The good stuff</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Real butter, seasonal fruit, and ingredients we’re proud to bake with.</p></div></div>
          <div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background text-primary"><Heart className="h-5 w-5" aria-hidden="true" /></span><div><h3 className="font-display text-xl">A little extra care</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Small batches mean every cake gets the time and attention it deserves.</p></div></div>
          <div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background text-primary"><Clock3 className="h-5 w-5" aria-hidden="true" /></span><div><h3 className="font-display text-xl">Fresh for your day</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Choose a pickup date with your custom cake, and we’ll have it ready.</p></div></div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
        <span className="font-display text-lg text-foreground">VÈLÔURÁ</span>
        <span>Made with care, a little flour, and a lot of heart.</span>
      </footer>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setDialogView("cart"); }}>
        <DialogContent data-lenis-prevent className="max-h-[90dvh] overflow-y-auto rounded-sm sm:max-w-xl">
          {dialogView === "cart" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-medium">{cart.length ? "Your little bag" : "Make something lovely."}</DialogTitle>
                <DialogDescription>{cart.length ? "A quick look at what’s coming to your table." : "Pick a cake from the table, or start with a custom one."}</DialogDescription>
              </DialogHeader>
              {cart.length > 0 ? (
                <div className="space-y-4">
                  <div className="divide-y divide-border">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 py-4">
                        <img src={item.image} alt="" width={1024} height={1024} className="h-20 w-20 shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2"><h3 className="font-display text-xl">{item.name}</h3><span className="shrink-0 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span></div>
                          {item.details && <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.details}</p>}
                          {!item.details && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
                          <div className="mt-3 inline-flex items-center border border-border">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.id, -1)}><Minus className="h-3.5 w-3.5" /></Button>
                            <span className="grid h-8 min-w-8 place-items-center text-sm">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.id, 1)}><Plus className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-4 font-semibold"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                  <p className="text-xs leading-5 text-muted-foreground">Sample checkout preview. No payment will be taken and no order will be sent.</p>
                  <Button className="w-full rounded-sm" size="lg" onClick={() => setDialogView("checkout")}>Continue to pickup details <ArrowRight aria-hidden="true" /></Button>
                  <Button variant="ghost" className="w-full rounded-sm" onClick={() => setDialogOpen(false)}>Keep browsing</Button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <Button variant="outline" className="w-full justify-between rounded-sm" onClick={() => { setDialogOpen(false); scrollToSection("cakes"); }}>Browse the cake table <ArrowRight aria-hidden="true" /></Button>
                  <Button className="w-full justify-between rounded-sm" onClick={() => setDialogView("builder")}>Make a custom cake <Sparkles aria-hidden="true" /></Button>
                </div>
              )}
            </>
          )}

          {/* The builder has its own view: it used to live inside "checkout" and only
              showed while the bag was empty, so it vanished once anything was added. */}
          {dialogView === "builder" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-medium">Make it your own.</DialogTitle>
                <DialogDescription>Choose your favorite layers and we’ll make a cake just for you.</DialogDescription>
              </DialogHeader>
                <div className="space-y-5">
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Size</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((option) => <Button key={option.name} type="button" variant={size === option.name ? "default" : "outline"} aria-pressed={size === option.name} onClick={() => setSize(option.name)} className="h-auto min-h-14 whitespace-normal rounded-sm px-2 py-2 text-xs">{option.name}<span className="font-semibold">{formatPrice(option.price)}</span></Button>)}
                    </div>
                  </fieldset>
                  <ChoiceGroup label="Sponge" options={cakeChoices.sponge} value={sponge} onChange={setSponge} />
                  <ChoiceGroup label="Filling" options={cakeChoices.filling} value={filling} onChange={setFilling} />
                  <ChoiceGroup label="Frosting" options={cakeChoices.frosting} value={frosting} onChange={setFrosting} />
                  <ChoiceGroup label="Finish" options={cakeChoices.finish} value={finish} onChange={setFinish} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold">Cake message <span className="font-normal text-muted-foreground">(optional)</span><Input maxLength={40} value={inscription} onChange={(event) => setInscription(event.target.value)} placeholder="A little message" /></label>
                    <label className="space-y-2 text-sm font-semibold">Pickup date <span className="font-normal text-muted-foreground">(optional)</span><Input type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} /></label>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-4 font-semibold"><span>Your custom cake</span><span>{formatPrice(customPrice)}</span></div>
                  <Button className="w-full rounded-sm" size="lg" onClick={addCustomCake}>Add custom cake to bag <ShoppingBag aria-hidden="true" /></Button>
                </div>
            </>
          )}

          {dialogView === "checkout" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-medium">A few finishing details</DialogTitle>
                <DialogDescription>We’ll have your order ready for bakery pickup.</DialogDescription>
              </DialogHeader>
                <form onSubmit={submitCheckout} className="space-y-5">
                  <div className="border-y border-border py-3 text-sm">
                    {summary.map((item) => <div key={item.id} className="flex justify-between gap-3 py-1"><span>{item.quantity} × {item.name}</span><span>{formatPrice((cart.find((cake) => cake.id === item.id)?.price ?? 0) * item.quantity)}</span></div>)}
                    <div className="mt-2 flex justify-between border-t border-border pt-3 font-semibold"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold">Your name<Input required autoComplete="name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Name for pickup" /></label>
                    <label className="space-y-2 text-sm font-semibold">Email address<Input required type="email" autoComplete="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" /></label>
                  </div>
                  <label className="block space-y-2 text-sm font-semibold">A note for the baker <span className="font-normal text-muted-foreground">(optional)</span><Textarea rows={3} placeholder="Allergies or anything else we should know" /></label>
                  <div className="flex items-start gap-3 bg-secondary/60 p-3 text-sm leading-5 text-secondary-foreground"><Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>Pickup at the bakery. We’ll confirm the details with you.</span></div>
                  <p className="text-xs leading-5 text-muted-foreground">Demo only: this preview doesn’t take payment or send real orders. Connect a store to accept orders.</p>
                  <Button type="submit" className="w-full rounded-sm" size="lg">Preview order confirmation <ArrowRight aria-hidden="true" /></Button>
                  <Button type="button" variant="ghost" className="w-full rounded-sm" onClick={() => setDialogView("cart")}>Back to bag</Button>
                </form>
            </>
          )}

          {dialogView === "complete" && (
            <div className="py-5 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-secondary-foreground"><Check className="h-7 w-7" aria-hidden="true" /></span>
              <DialogTitle className="mt-5 font-display text-3xl font-medium">That looks lovely, {customerName || "friend"}.</DialogTitle>
              <DialogDescription className="mx-auto mt-2 max-w-sm leading-6">Your sample checkout is complete. No payment was taken and no order was sent.</DialogDescription>
              <Button className="mt-6 rounded-sm" onClick={() => { setDialogOpen(false); setDialogView("cart"); }}>Back to the bakery <X className="h-4 w-4" aria-hidden="true" /></Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
