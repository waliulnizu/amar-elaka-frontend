import axios from "axios";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function Newsfeed({ posts, setPosts, currentUser }) {
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'রক্তদান': return 'badge-error text-white';
      case 'ব্যবসা': return 'badge-info text-white';
      case 'সাহায্য': return 'badge-warning';
      case 'সমস্যা': return 'badge-error text-white';
      default: return 'badge-ghost bg-base-200';
    }
  };

  const handleAction = async (actionType, postId, additionalData = {}) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}/${actionType}`, additionalData, { withCredentials: true });
      
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, ...res.data.post, ...res.data } : p));
      
      if (actionType === 'solve' && res.data.isSolved) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
      alert(res.data.message);
    } catch (error) {
      alert("অ্যাকশনটি সম্পন্ন করতে সমস্যা হয়েছে।");
    }
  };

  if (posts.length === 0) {
    return <div className="p-8 bg-base-100 border border-dashed rounded-xl text-center text-gray-400">📰 এখনো কোনো পোস্ট নেই!</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <div key={post._id} className="bg-base-100 shadow-md rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-base-200">
              {post.user?.profileImage ? (
                <img src={post.user.profileImage} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-gray-500">{post.user?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm">{post.user?.name || "কমিউনিটি মেম্বার"}</h4>
              <div className="text-[11px] text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('bn-BD')} • 📍 {post.wardOrGram ? `${post.wardOrGram}, ` : ""}{post.userThana || ""}
              </div>
            </div>
            <div className={`badge badge-sm px-3 py-2 ml-auto ${getCategoryBadgeClass(post.category)}`}>
              {post.category}
            </div>
          </div>

          <p className="mt-3 text-sm">{post.content}</p>

          {post.postImage && (
            <img src={post.postImage} alt="Post" className="mt-3 rounded-lg max-h-[400px] w-full object-cover" />
          )}

          {/* সমস্যা ক্যাটাগরির বাটন */}
          {post.category === 'সমস্যা' && (
            <div className="mt-3 pt-3 border-t flex justify-end gap-2">
              <button onClick={() => handleAction('follow', post._id)} className="btn btn-sm text-xs">
                🔔 জানতে ইচ্ছুক ({post.followers?.length || 0})
              </button>
              {(post.user?._id === currentUser?.id || post.user === currentUser?.id) && (
                <button onClick={() => handleAction('solve', post._id)} className="btn btn-sm btn-success text-white text-xs">
                  {post.isSolved ? "🔄 উন্মুক্ত করুন" : "✅ সমাধান হয়েছে"}
                </button>
              )}
            </div>
          )}

          {/* সাহায্য এবং রক্তদান ক্যাটাগরির ভলান্টিয়ার ইন্টারফেস */}
          {(post.category === 'সাহায্য' || post.category === 'রক্তদান') && (
            <div className={`mt-3 pt-3 border-t flex flex-col gap-2 p-3 rounded-lg ${
              post.helperSelected ? "bg-success/5 border-success/20" : "bg-base-50"
            }`}>
              <div className="flex justify-between items-center text-xs w-full">
                <Link href={`/posts/${post._id}`} className="text-gray-500 font-medium hover:text-primary transition-colors">
                  🤝 ভলান্টিয়ার সংখ্যা: <strong className="text-primary text-sm hover:underline">{post.helpers?.length || 0} জন</strong>
                </Link>
                {post.helperSelected && (
                  <span className="text-success font-bold bg-success/10 px-2 py-1 rounded-md text-[11px]">
                    ✓ কমপ্লিট
                  </span>
                )}
              </div>

              {post.helperSelected && (
                <div className="text-xs bg-white p-2 rounded border border-success/30 text-gray-700">
                  🎉 <strong>Helped from:</strong> <span className="text-success font-bold">{post.helperSelected?.name}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 items-center w-full border-t border-dashed border-base-200 pt-2">
                <button
                  disabled={!!post.helperSelected}
                  onClick={() => handleAction('volunteer', post._id)}
                  className={`btn btn-xs md:btn-sm border-none rounded-full px-4 font-bold ${
                    post.helperSelected
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : post.helpers?.includes(currentUser?.id || currentUser?._id)
                      ? "bg-success text-white"
                      : "bg-primary text-white hover:bg-primary-focus"
                  }`}
                >
                  {post.helperSelected
                    ? "✅ সম্পন্ন"
                    : post.category === 'রক্তদান'
                    ? "🩸 আমি রক্ত দিতে চাই"
                    : "🙋‍♂️ আমি সাহায্য করতে চাই"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}