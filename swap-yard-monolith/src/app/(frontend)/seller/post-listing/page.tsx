            "use client";

            import {
            Upload,
            Lightbulb,
            ShieldCheck,
            X,
            Check
            } from "lucide-react";

            import { usePostListing } from "@/hooks/seller/usePostListing";
            import { Toggle } from "@/components/seller/Toggle";

            export default function PostListingForm() {

            const {
            state,
            setters,
            refs,
            handlers
            } = usePostListing();

            return (
            <>
            <form
            onSubmit={handlers.handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 w-full max-w-5xl mx-auto"
            >

            <h2 className="text-2xl font-bold text-[#002147] mb-8 hidden md:block">
            Upload Images from device
            </h2>

            {state.error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {state.error}
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

            <div className="space-y-8">

            <h2 className="text-xl font-bold text-[#002147] md:hidden">
            Upload Images from device
            </h2>


            <div>

            <div
            onClick={()=>refs.fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 h-72 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer"
            >

            <input
            type="file"
            ref={refs.fileInputRef}
            onChange={handlers.handleImageChange}
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            />

            <p className="text-sm text-gray-600 mb-1">
            Click or drag files here to upload
            </p>

            <p className="text-xs text-gray-400 mb-6">
            Max of 6 images JPG/PNG only
            </p>

            <div className="flex items-center gap-4 w-full max-w-xs mb-6">
            <div className="h-px bg-gray-300 flex-1"/>
            <span className="text-xs text-gray-400">
            OR
            </span>
            <div className="h-px bg-gray-300 flex-1"/>
            </div>

            <button
            type="button"
            className="bg-[#EB3B18] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
            >
            <Upload size={18}/>
            Upload Images
            </button>

            </div>


            {state.images.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">

            {state.images.map((img,idx)=>(
            <div
            key={idx}
            className="relative w-16 h-16 rounded border overflow-hidden"
            >
            <img
            src={URL.createObjectURL(img)}
            alt=""
            className="w-full h-full object-cover"
            />

            <button
            type="button"
            onClick={(e)=>{
            e.stopPropagation();
            handlers.removeImage(idx);
            }}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
            >
            <X size={12}/>
            </button>

            </div>
            ))}

            </div>
            )}

            </div>

            <div>

            <h3 className="text-xl font-bold text-[#002147] mb-4">
            Category
            </h3>

            <div className="space-y-4">

            <div>
            <label className="block text-sm mb-1.5">
            Item Category
            </label>

            <select
            value={state.categoryId}
            onChange={(e)=>
            setters.setCategoryId(
            e.target.value
            )
            }
            className="w-full border rounded-lg px-4 py-3 text-sm"
            >
            <option value="">
            {state.categories.length
            ? "Select Category"
            : "Loading categories..."
            }
            </option>

            {state.categories.map(cat=>(
            <option
            key={cat.id}
            value={cat.id}
            >
            {cat.name}
            </option>
            ))}

            </select>
            </div>


            <div>
            <label className="block text-sm mb-1.5">
            Item Condition
            </label>

            <select
            value={state.condition}
            onChange={(e)=>
            setters.setCondition(
            e.target.value
            )
            }
            className="w-full border rounded-lg px-4 py-3 text-sm"
            >
            <option value="">
            Select Condition
            </option>

            <option value="NEW">
            New
            </option>

            <option value="FAIRLYNEW">
            Used - Like New
            </option>

            <option value="SECONDHAND">
            Second Hand
            </option>

            <option value="FAIR">
            Fair
            </option>

            <option value="GOOD">
            Good
            </option>

            </select>
            </div>

            </div>
            </div>



            <div>

            <h3 className="text-xl font-bold text-[#002147] mb-4">
            Contact
            </h3>

            <div>
            <label className="block text-sm mb-1.5">
            Contact Number
            </label>

            <input
            type="text"
            value={state.contact}
            onChange={(e)=>
            setters.setContact(
            e.target.value
            )
            }
            placeholder="Enter Phone Number"
            className="w-full border rounded-lg px-4 py-3 text-sm"
            />

            </div>

            </div>

            </div>



            <div className="space-y-8">

            <div>

            <h3 className="text-xl font-bold text-[#002147] mb-4">
            Description
            </h3>

            <div className="space-y-4">

            <input
            value={state.name}
            onChange={(e)=>
            setters.setName(
            e.target.value
            )
            }
            placeholder="Item Title"
            className="w-full border rounded-lg px-4 py-3"
            />


            <textarea
            value={state.description}
            onChange={(e)=>
            setters.setDescription(
            e.target.value
            )
            }
            placeholder="Item Description"
            className="w-full border rounded-lg px-4 py-3 h-40"
            />


            <input
            type="number"
            value={state.price}
            onChange={(e)=>
            setters.setPrice(
            e.target.value
            )
            }
            placeholder="Item Price"
            className="w-full border rounded-lg px-4 py-3"
            />



            <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
            Negotiable
            </span>

            <Toggle
            checked={state.isNegotiable}
            onChange={()=>
            setters.setIsNegotiable(
            !state.isNegotiable
            )
            }
            ariaLabel="Negotiable"
            />

            </div>

            </div>

            </div>


            <div>

            <h3 className="text-xl font-bold text-[#002147] mb-4">
            Location & Delivery
            </h3>

            <div className="space-y-4">

            <select
            value={state.stateLocation}
            onChange={(e)=>
            setters.setStateLocation(
            e.target.value
            )
            }
            className="w-full border rounded-lg px-4 py-3"
            >

            <option value="">
            Select State
            </option>

            {state.nigeriaStates.map(item=>(
            <option
            key={item}
            value={item}
            >
            {item}
            </option>
            ))}

            </select>



            <input
            value={state.town}
            onChange={(e)=>
            setters.setTown(
            e.target.value
            )
            }
            placeholder="Town / City"
            className="w-full border rounded-lg px-4 py-3"
            />



            <select
            value={state.deliveryOption}
            onChange={(e)=>
            setters.setDeliveryOption(
            e.target.value as
            ""|"PICKUP"|"DELIVERY"
            )
            }
            className="w-full border rounded-lg px-4 py-3"
            >

            <option value="">
            Select Option
            </option>

            <option value="PICKUP">
            Pick up Only
            </option>

            <option value="DELIVERY">
            Delivery Available
            </option>

            </select>

            </div>

            </div>




            </div>
            </div>



            <div className="mt-12 space-y-4 max-w-full">

            <button
            type="button"
            onClick={handlers.resetForm}
            className="w-full border border-[#682d21] text-[#EB3B18] py-3.5 rounded-lg font-bold"
            >
            Discard
            </button>

            <button
            type="submit"
            disabled={state.isSubmitting}
            className="w-full bg-[#EB3B18] text-white py-3.5 rounded-lg font-bold"
            >
            {state.isSubmitting
            ? "Posting Listing..."
            : "Post Listing"}
            </button>

            </div>


            <div className="mt-16 pt-8 border-t">

            <div className="flex items-center gap-2 mb-4">
            <Lightbulb
            size={20}
            className="fill-current"
            />

            <h3 className="text-lg font-extrabold">
            Tip of the day
            </h3>

            </div>

            <p className="text-sm text-gray-700">
            Clear, well-lit images increase your chances
            of a sale. Use multiple angles, clean
            backgrounds and show imperfections honestly.
            </p>

            </div>

            </form>



            {/* SUCCESS MODAL */}
            {state.showSuccessModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative">

            <button
            onClick={()=>
            setters.setShowSuccessModal(
            false
            )
            }
            className="absolute top-4 right-4"
            >
            <X size={24}/>
            </button>


            <div className="w-24 h-24 bg-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check
            size={48}
            className="text-white"
            />
            </div>

            <h3 className="text-xl font-bold mb-8">
            Congratulations, your item is now live
            </h3>

            <div className="flex flex-col gap-3">

            <button
            onClick={handlers.resetForm}
            className="bg-[#EB3B18] text-white py-3.5 rounded-lg font-bold"
            >
            Post another Item
            </button>


            <button
            onClick={()=>
            handlers.router.push(
            "/seller/overview"
            )
            }
            className="border border-[#EB3B18] text-[#EB3B18] py-3.5 rounded-lg font-bold"
            >
            Go to Dashboard
            </button>

            </div>

            </div>

            </div>

            )}

            </>
            );

            }