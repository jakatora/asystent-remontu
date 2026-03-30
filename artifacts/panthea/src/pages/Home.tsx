import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Phone, 
  MapPin, 
  Clock, 
  Scissors, 
  Sparkles, 
  Palette, 
  Brush, 
  Droplets, 
  Flower, 
  HeartHandshake,
  MessageCircle,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

import heroImg from "@/assets/hero.png";
import stylingImg from "@/assets/styling.png";
import spaImg from "@/assets/spa.png";
import resultImg from "@/assets/result.png";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sticky Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-background/90 backdrop-blur-md border-b border-border py-4 shadow-sm" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div 
            className="font-serif text-2xl tracking-wider font-semibold cursor-pointer text-primary"
            onClick={() => scrollTo('hero')}
          >
            PANTHÈA
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest">
            <button onClick={() => scrollTo('o-nas')} className="hover:text-primary transition-colors">O nas</button>
            <button onClick={() => scrollTo('uslugi')} className="hover:text-primary transition-colors">Usługi</button>
            <button onClick={() => scrollTo('efekty')} className="hover:text-primary transition-colors">Efekty</button>
            <button onClick={() => scrollTo('cennik')} className="hover:text-primary transition-colors">Cennik</button>
            <button onClick={() => scrollTo('kontakt')} className="hover:text-primary transition-colors">Kontakt</button>
          </div>

          <div className="hidden md:block">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-wider text-xs"
              onClick={() => scrollTo('kontakt')}
            >
              Umów wizytę
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border py-6 px-6 flex flex-col space-y-6 text-center uppercase tracking-widest text-sm shadow-xl">
            <button onClick={() => scrollTo('o-nas')} className="hover:text-primary transition-colors">O nas</button>
            <button onClick={() => scrollTo('uslugi')} className="hover:text-primary transition-colors">Usługi</button>
            <button onClick={() => scrollTo('efekty')} className="hover:text-primary transition-colors">Efekty</button>
            <button onClick={() => scrollTo('cennik')} className="hover:text-primary transition-colors">Cennik</button>
            <button onClick={() => scrollTo('kontakt')} className="hover:text-primary transition-colors">Kontakt</button>
            <Button 
              className="bg-primary text-primary-foreground rounded-none w-full"
              onClick={() => scrollTo('kontakt')}
            >
              Umów wizytę
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Panthèa Atelier Interior" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <span className="block text-primary uppercase tracking-[0.3em] text-sm md:text-base mb-6">Atelier Hair & Spa</span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
            Panthèa
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
            Twój wyjątkowy salon fryzjerski i spa w Gdańsku
          </p>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 py-6 uppercase tracking-widest text-sm"
            onClick={() => scrollTo('kontakt')}
          >
            Umów wizytę
          </Button>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="o-nas" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="w-full md:w-1/2"
            >
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/30 z-0 hidden md:block translate-x-4 translate-y-4"></div>
                <img 
                  src={stylingImg} 
                  alt="Styling in Panthèa Atelier" 
                  className="w-full h-[500px] object-cover relative z-10 grayscale-[0.2] contrast-125"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="w-full md:w-1/2 space-y-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="text-primary uppercase tracking-widest text-xs">O nas</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6">Sztuka piękna w sercu Gdańska</h2>
              <p className="text-muted-foreground font-light leading-relaxed text-lg">
                Panthèa Atelier to przestrzeń stworzona z pasji do piękna i dbałości o detale. W naszym salonie w Gdańsku łączymy najwyższej jakości usługi fryzjerskie z relaksującymi zabiegami spa, tworząc azyl dla ciała i zmysłów.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed text-lg">
                Nasz profesjonalny zespół stylistów i terapeutów dba o to, by każda wizyta była wyjątkowym doświadczeniem, dopasowanym do Twoich indywidualnych potrzeb. Pracujemy wyłącznie na luksusowych, starannie wyselekcjonowanych produktach.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="uslugi" className="py-24 md:py-32 bg-secondary/30 border-y border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-primary uppercase tracking-widest text-xs block mb-4">Czego pragniesz?</span>
            <h2 className="font-serif text-4xl md:text-5xl">Nasze Usługi</h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: "Strzyżenie damskie", icon: <Scissors className="w-8 h-8" /> },
              { title: "Strzyżenie męskie", icon: <Brush className="w-8 h-8" /> },
              { title: "Koloryzacja", icon: <Palette className="w-8 h-8" /> },
              { title: "Balayage / Ombre", icon: <Sparkles className="w-8 h-8" /> },
              { title: "Keratyna", icon: <Droplets className="w-8 h-8" /> },
              { title: "Pielęgnacja włosów", icon: <Flower className="w-8 h-8" /> },
              { title: "Masaż", icon: <HeartHandshake className="w-8 h-8" /> },
              { title: "Zabiegi Spa", icon: <Flower className="w-8 h-8" /> },
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="bg-background border border-border/50 p-8 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors duration-300"
              >
                <div className="text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="font-serif text-xl">{service.title}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery / Results Section */}
      <section id="efekty" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <span className="text-primary uppercase tracking-widest text-xs block mb-4">Portfolio</span>
              <h2 className="font-serif text-4xl md:text-5xl">Nasze Efekty</h2>
            </div>
            <p className="text-muted-foreground font-light max-w-md">
              Odkryj metamorfozy naszych klientów i pozwól się zainspirować. Każda stylizacja to dla nas dzieło sztuki.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group overflow-hidden relative aspect-[4/5]"
            >
              <img 
                src={resultImg} 
                alt="Hair result" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <span className="font-serif text-2xl text-white">Koloryzacja & Styling</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group overflow-hidden relative aspect-[4/5] md:mt-16"
            >
              <img 
                src={spaImg} 
                alt="Spa treatment" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <span className="font-serif text-2xl text-white">Relaks & Spa</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="cennik" className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-primary uppercase tracking-widest text-xs block mb-4">Inwestycja w siebie</span>
            <h2 className="font-serif text-4xl md:text-5xl">Cennik Wybranych Usług</h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            {[
              { name: "Strzyżenie damskie", price: "od 80 zł" },
              { name: "Koloryzacja", price: "od 180 zł" },
              { name: "Balayage", price: "od 250 zł" },
              { name: "Keratyna", price: "od 300 zł" },
              { name: "Masaż 60min", price: "od 150 zł" },
              { name: "Zabieg spa", price: "od 200 zł" },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="flex items-center justify-between border-b border-border/50 pb-4"
              >
                <span className="font-serif text-xl tracking-wide">{item.name}</span>
                <span className="text-primary font-medium">{item.price}</span>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-12 text-center text-muted-foreground text-sm font-light">
            * Ostateczna cena zależy od długości i gęstości włosów. Zapraszamy na darmową konsultację.
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-10"
            >
              <div>
                <span className="text-primary uppercase tracking-widest text-xs block mb-4">Czekamy na Ciebie</span>
                <h2 className="font-serif text-4xl md:text-5xl mb-6">Kontakt</h2>
                <p className="text-muted-foreground font-light text-lg">
                  Umów się na wizytę już dziś. Odpowiemy na wszystkie Twoje pytania i dobierzemy odpowiedni termin.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-full shrink-0 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl mb-1">Adres</h4>
                    <p className="text-muted-foreground font-light">Garncarska 16/17<br />80-894 Gdańsk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-full shrink-0 text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl mb-1">Telefon</h4>
                    <a href="tel:+48886743786" className="text-muted-foreground font-light hover:text-primary transition-colors">
                      +48 886 743 786
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-full shrink-0 text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl mb-1">Godziny otwarcia</h4>
                    <p className="text-muted-foreground font-light">
                      Poniedziałek - Piątek: 9:00 - 19:00<br />
                      Sobota: 9:00 - 15:00
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="h-[400px] lg:h-auto min-h-[400px] bg-secondary border border-border/50 relative overflow-hidden"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2325.297486450638!2d18.6465492!3d54.3519827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46fd73a0134015f3%3A0xcda8d7d42cfb4119!2sGarncarska%2016%2F17%2C%2080-894%20Gda%C5%84sk!5e0!3m2!1spl!2spl!4v1700000000000!5m2!1spl!2spl" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Panthèa Atelier Map"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-border/30 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl tracking-widest text-primary mb-4">PANTHÈA</h2>
          <p className="text-muted-foreground font-light text-sm mb-6">
            Atelier Hair & Spa<br/>
            Garncarska 16/17, 80-894 Gdańsk<br/>
            +48 886 743 786
          </p>
          <div className="h-[1px] w-24 bg-border/50 mx-auto mb-6"></div>
          <p className="text-muted-foreground/60 text-xs uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Panthèa Atelier. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>

      {/* Floating CTA */}
      <a 
        href="tel:+48886743786"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 z-50 animate-bounce"
        aria-label="Zadzwoń teraz"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
