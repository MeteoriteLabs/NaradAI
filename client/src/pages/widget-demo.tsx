import { Widget } from "../widget/Widget";

export default function WidgetDemo() {
  const agentId = new URLSearchParams(window.location.search).get("agentId") || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Narada AI Widget Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates the embeddable widget. The floating button will appear in the bottom-right corner.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" id="features">Features</h2>
            <p className="text-muted-foreground">
              Explore our powerful features that make your business stand out.
            </p>
            <div className="grid gap-4">
              <div className="p-6 border rounded-lg" id="pricing">
                <h3 className="font-semibold mb-2">Flexible Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from our range of plans that suit your needs.
                </p>
              </div>
              <div className="p-6 border rounded-lg" id="support">
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is always here to help you succeed.
                </p>
              </div>
              <div className="p-6 border rounded-lg" id="integration">
                <h3 className="font-semibold mb-2">Easy Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Get started in minutes with our simple setup process.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Get Started</h2>
            <p className="text-muted-foreground">
              Ready to transform your business? Let's get started today.
            </p>
            <div className="space-y-4">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Step 1: Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  Create your account in just a few clicks.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Step 2: Configure</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your settings to match your workflow.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Step 3: Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Go live and start seeing results immediately.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="p-6 border rounded-lg max-w-2xl" id="contact-form">
            <p className="text-muted-foreground mb-4">
              Have questions? Click the chat button in the bottom-right corner to talk to our AI assistant,
              or fill out the contact form when prompted!
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">support@narada-ai.com</p>
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {agentId && (
        <Widget
          agentId={agentId}
          websocketUrl={`ws://${window.location.hostname}:${window.location.port}/ws`}
        />
      )}
    </div>
  );
}
