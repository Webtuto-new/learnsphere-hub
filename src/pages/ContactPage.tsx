import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MessageCircle } from "lucide-react";

const ContactPage = () => {
  const whatsappLink = "https://wa.me/94728028444";

  return (
    <Layout>
      <SEOHead title="Contact Us | Webtuto.LK" description="Get in touch with the Webtuto team for support and inquiries." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground">Have questions? We're here to help. Reach out to us via email or WhatsApp.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Email Card */}
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">Email</h2>
              <a
                href="mailto:admin@webtuto.lk"
                className="text-primary hover:underline text-lg"
              >
                admin@webtuto.lk
              </a>
              <p className="text-muted-foreground text-sm mt-2">We typically respond within 24 hours</p>
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-green-500" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">WhatsApp</h2>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline text-lg flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                0728 028 444
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
