import LightButton from "@/components/buttons/LightButton";
import Input from "@/components/Input";
import { X } from "lucide-react";
import { useRef } from "react";

interface AddTextPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    text1: string,
    text2: string,
    locale1: string,
    locale2: string,
  ) => void;
}

export default function AddTextPairModal({
  isOpen,
  onClose,
  onAdd,
}: AddTextPairModalProps) {
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const input4Ref = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleAdd = () => {
    if (
      !input1Ref.current?.value ||
      !input2Ref.current?.value ||
      !input3Ref.current?.value ||
      !input4Ref.current?.value
    )
      return;

    const text1 = input1Ref.current.value;
    const text2 = input2Ref.current.value;
    const locale1 = input3Ref.current.value;
    const locale2 = input4Ref.current.value;
    if (
      typeof text1 === "string" &&
      typeof text2 === "string" &&
      typeof locale1 === "string" &&
      typeof locale2 === "string" &&
      text1.trim() !== "" &&
      text2.trim() !== "" &&
      locale1.trim() !== "" &&
      locale2.trim() !== ""
    ) {
      onAdd(text1, text2, locale1, locale2);
      input1Ref.current.value = "";
      input2Ref.current.value = "";
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAdd();
        }
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex">
          <h2 className="flex-1 text-xl font-light mb-4 text-center">
            Add New Text Pair
          </h2>
          <X onClick={onClose} className="hover:cursor-pointer"></X>
        </div>
        <div>
          <div>
            text1<Input ref={input1Ref} className="w-full"></Input>
          </div>
          <div>
            text2<Input ref={input2Ref} className="w-full"></Input>
          </div>
          <div>
            locale1<Input ref={input3Ref} className="w-full"></Input>
          </div>
          <div>
            locale2<Input ref={input4Ref} className="w-full"></Input>
          </div>
        </div>
        <LightButton onClick={handleAdd}>Add</LightButton>
      </div>
    </div>
  );
}
