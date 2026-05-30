// frontend/src/components/DonorCard.jsx

const DonorCard = ({ donor }) => {
  const isEligible = (lastDate) => {
    if (!lastDate) return true;
    const last = new Date(lastDate);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return last < oneMonthAgo; // ১ মাস পার হয়েছে কি না
  };

  const getStatus = (lastDate) => {
    if (!lastDate) return "সদ্য রক্তদানের তথ্য নেই";
    const last = new Date(lastDate);
    const today = new Date();
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${30 - diffDays} দিন পর রক্ত দিতে পারবেন`;
    return "এখন রক্তদানের জন্য যোগ্য";
  };

  return (
    <div className={`p-4 border rounded-xl ${isEligible(donor.lastDonationDate) ? 'bg-green-50' : 'bg-orange-50'}`}>
      <h3 className="font-bold">{donor.name}</h3>
      <p>রক্তের গ্রুপ: {donor.bloodGroup}</p>
      <p className="text-sm font-semibold">
        স্ট্যাটাস: {getStatus(donor.lastDonationDate)}
      </p>
      {/* ১ মাস না হওয়া দাতা হলেও ফোন নাম্বার দেখা যাবে, যাতে আগে থেকে নক দিয়ে রাখা যায় */}
      <a href={`tel:${donor.phone}`} className="btn btn-primary btn-xs mt-2">
        কল করুন
      </a>
    </div>
  );
};