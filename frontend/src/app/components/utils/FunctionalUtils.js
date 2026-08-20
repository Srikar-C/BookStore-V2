import { colors } from "@/app/user/styles/style";

export function HashTag({ icon, text }) {
    return (
        <div className="flex gap-5 items-center">
            <span className="text-2xl p-2 bg-white text-black rounded-2xl">{icon}</span>
            <p className="text-xl">{text}</p>
        </div>
    )
}


export function getColor(field, focusedField, errors) {

    const fieldError = errors[field];

    if (fieldError?.type === "validation") {
        return colors.validation;
    }
    else if (fieldError?.type === "exists") {
        return colors.exists;
    }
    else {
        if (errors[field]) {
            return colors.error;
        }

        if (focusedField === field) {
            return colors.focus;
        }
        return colors.normal;
    }
};


export function Section({ icon, text, click, path, url, count }) {
    const active = path === url;
    return (
        <div className={`flex gap-2 items-center justify-between ${active ? "bg-(--section-hover)" : "hover:bg-(--section-hover)"} p-2 cursor-pointer`} onClick={click}>
            <div className="text flex gap-2 items-center">
                <span className="text-2xl">{icon}</span>
                <h5>{text}</h5>
            </div>
            {path == "/bookstore/carts" && count != null && count > 0 && <span className="rounded-full w-7 h-7 flex items-center font-semibold text-md justify-center bg-red-500 text-white">{count > 10 ? "10+" : count}</span>}
        </div>
    )
}

export function getDeliveryDate(setDate, orderedBooks) {
    const today = new Date();
    let daysToAdd;
    if (orderedBooks.length < 5) {
        daysToAdd = Math.floor(Math.random() * 3) + 3;
    } else {
        daysToAdd = Math.ceil(orderedBooks.length / 2);
    }
    today.setDate(today.getDate() + daysToAdd);
    setDate(today);
}