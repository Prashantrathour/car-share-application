import Accordion from "./component/Accordion";


const termsData = [
  {
    title: 'Introduction',
    content: `By using our platform, you agree to comply with our terms and conditions.`,
  },
  {
    title: 'User Responsibilities',
    content: `You are responsible for providing accurate information and respecting other users.`,
  },
  {
    title: 'Payment and Fees',
    content: `We charge a small service fee for each successful booking.`,
  },
  {
    title: 'Cancellations and Refunds',
    content: `Cancellations must be made at least 24 hours before the trip. Refunds are processed within 3-5 business days.`,
  },
  {
    title: 'Liability and Disputes',
    content: `We are not liable for disputes between users but will assist in resolving conflicts.`,
  },
];

const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Terms of Service</h1>
      <div className="space-y-4">
        {termsData.map((item, index) => (
          <Accordion key={index} title={item.title} content={item.content} />
        ))}
      </div>
    </div>
  );
};

export default TermsOfService;
