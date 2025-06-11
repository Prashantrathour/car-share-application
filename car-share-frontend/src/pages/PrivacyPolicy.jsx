import Accordion from "./component/Accordion";


const privacyData = [
  {
    title: 'Information We Collect',
    content: `We collect personal information such as name, email, phone number, and payment details to provide better services.`,
  },
  {
    title: 'How We Use Information',
    content: `We use your information to match car owners and passengers, process payments, and improve our services.`,
  },
  {
    title: 'Data Protection',
    content: `Your data is encrypted and stored securely. We follow industry best practices to prevent unauthorized access.`,
  },
  {
    title: 'Third-Party Sharing',
    content: `We do not sell or share your data with third parties without your consent, except as required by law.`,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>
      <div className="space-y-4">
        {privacyData.map((item, index) => (
          <Accordion key={index} title={item.title} content={item.content} />
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
