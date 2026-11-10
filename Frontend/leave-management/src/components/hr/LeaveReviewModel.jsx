import React, { useState, useEffect } from "react";

const LeaveReviewModal = ({
  isOpen,
  action,
  leave,
  onSubmit,
  onCancel,
}) => {
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReviewComment("");
    }
  }, [isOpen, action, leave?.id]);

  if (!isOpen) return null;

  const isReject = action === "reject";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isReject && !reviewComment.trim()) {
      return;
    }

    onSubmit({
      leave_id: leave.id,
      reviewer_comment: reviewComment.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        <h2 className="text-xl font-bold text-green-800">
          {isReject ? "Reject Leave Request" : "Approve Leave Request"}
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          {isReject
            ? "Please provide a reason for rejecting this leave request."
            : "You can add an optional comment before approving this request."}
        </p>

        {leave && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-4">
            <p className="font-semibold text-gray-800">
              {leave.first_name} {leave.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {leave.leave_type || "N/A"} · {leave.requested_days} days
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5">

          <label className="label font-semibold">
            Reviewer Comment
            {isReject && <span className="text-red-600">*</span>}
          </label>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder={
              isReject
                ? "Enter reason for rejection..."
                : "Enter an optional comment..."
            }
            className="textarea textarea-bordered w-full focus:outline-green-500"
            rows={4}
            required={isReject}
          />

          <div className="flex justify-end gap-3 mt-6">

            <button type="button" onClick={onCancel} className="btn btn-ghost" >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isReject && !reviewComment.trim()}
              className={`btn text-white border-none ${
                isReject
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {isReject ? "Confirm Rejection" : "Confirm Approval"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveReviewModal;