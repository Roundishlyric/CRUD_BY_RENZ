import React, { useMemo, useState } from "react";
import "./userForm.css";
import toast from "react-hot-toast";
import useConfirm from "./useConfirm";

/**
 * Props:
 * - mode: "add" | "edit"
 * - initial: {name,email,address,birthday,contactNumber}
 * - onSubmit: async (payload) => void
 * - onCancel: () => void
 * - submitting: boolean
 */
const UserForm = ({ mode = "add", initial, onSubmit, onCancel, submitting }) => {
  const { confirm, ConfirmDialog } = useConfirm();
  const init = useMemo(
    () => ({
      name: initial?.name || "",
      email: initial?.email || "",
      address: initial?.address || "",
      birthday: initial?.birthday || "",
      contactNumber: initial?.contactNumber || "",
    }),
    [initial]
  );

  const [user, setUser] = useState(init);

  const inputhandler = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      const onlyDigits = value.replace(/\D/g, "");
      setUser((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!user.name || !user.email || !user.address || !user.birthday || !user.contactNumber) {
      toast.error("Please fill out all fields before submitting.", { position: "top-right" });
      return false;
    }
    if (!user.email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return false;
    }
    if (!/^[0-9]+$/.test(user.contactNumber)) {
      toast.error("Contact number must contain numbers only.", { position: "top-right" });
      return false;
    }
    if (user.contactNumber.length < 7 || user.contactNumber.length > 15) {
      toast.error("Contact number must be 7 to 15 digits.", { position: "top-right" });
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const confirmText =
      mode === "edit" ? "Are you sure you want to update this user?" : "Are you sure you want to create this user?";

    const ok = await confirm({
      title: mode === "edit" ? "Update user" : "Create user",
      message: confirmText,
      confirmText: mode === "edit" ? "Update" : "Create",
      cancelText: "Cancel",
      variant: "default",
    });
    if (!ok) return;

    await onSubmit?.({ ...user });
  };

  return (
    <>
      <form className="rzForm" onSubmit={submit}>
        <div className="rzGrid">
        <div className="rzField">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={user.name} onChange={inputhandler} placeholder="Enter name" autoComplete="off" />
        </div>

        <div className="rzField">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" value={user.email} onChange={inputhandler} placeholder="Enter email" autoComplete="off" />
        </div>

        <div className="rzField rzSpan2">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={user.address} onChange={inputhandler} placeholder="Enter address" autoComplete="off" />
        </div>

        <div className="rzField">
          <label htmlFor="birthday">Birthday</label>
          <input id="birthday" type="date" name="birthday" value={user.birthday} onChange={inputhandler} />
        </div>

        <div className="rzField">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            id="contactNumber"
            name="contactNumber"
            value={user.contactNumber}
            onChange={inputhandler}
            placeholder="Numbers only"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
          />
        </div>
      </div>

        <div className="rzActions">
          <button type="button" className="rzBtn rzBtnGhost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="rzBtn rzBtnPrimary" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "edit" ? "Update" : "Create"}
          </button>
        </div>
      </form>
      <ConfirmDialog />
    </>
  );
};

export default UserForm;
