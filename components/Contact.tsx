export default function Contact() {
    return (
      <section className="py-20 px-4 text-center text-white bg-black" id="contact">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-400 text-lg mb-6">
          Have questions or feedback? We'd love to hear from you.
        </p>
        <p className="text-gray-300">
          Email us at{" "}
          <a href="mailto:support@rezzy.ai" className="text-pink-500 underline">
            support@rezzy.ai
          </a>
        </p>
      </section>
    );
  }
  