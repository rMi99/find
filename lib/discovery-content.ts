import { boardingAudiences, type SearchFilters } from "./types";
import { locations } from "./catalog";
export const categoryContent: Record<
  string,
  { intro: string; check: string; question: string; answer: string }
> = {
  Boarding: {
    intro:
      "Find boarding houses, also called bodim, for women, men and couples in Sri Lanka. Compare private and shared rooms by monthly price, people per room and available spaces.",
    check:
      "Match room capacity to your group, then check how many spaces are actually free. A six-person room with one vacancy can accommodate one new tenant. Confirm whether the advertised monthly price covers one person or the whole room, and ask about meals, utility bills, deposits, visitors and entry times.",
    question: "Can two or three friends find a boarding room together?",
    answer:
      "Use Available spaces needed for the number of people moving in, and People per room for the room size you want. Select two, three, six or another number. For a couple, search for at least two available spaces and confirm whether the room is private.",
  },
  Villa: {
    intro:
      "Explore Sri Lankan villas for quiet weekends, family holidays and group stays. Compare the property layout, sleeping arrangements and facilities before contacting a host.",
    check:
      "Confirm whether you are reserving the entire villa or individual rooms. Ask if the pool and garden are private, how many beds are provided, whether a caretaker stays on site and if meals or cooking facilities are available.",
    question: "Does a villa price cover the whole property?",
    answer:
      "Pricing varies by listing. Read the pricing period and ask the host for a full quote for your dates and group, including additional guests, meals and cleaning.",
  },
  Apartment: {
    intro:
      "Discover apartments in Sri Lanka for daily living or shorter stays. Compare location, furnishing and monthly or nightly prices on the same basis.",
    check:
      "Ask about lift access, parking allocation, backup water, internet and building rules. Confirm whether electricity, water, management fees and shared amenities are included in the advertised price.",
    question: "What should I check during an apartment viewing?",
    answer:
      "Inspect ventilation, water pressure, mobile reception and the condition of included furniture. Test the commute at a useful time and ask about maintenance responsibilities before agreeing to terms.",
  },
  House: {
    intro:
      "Browse houses to rent or buy across Sri Lanka. Compare neighborhoods, usable space, property condition and the purpose of each offer.",
    check:
      "Separate rental and sale prices using the purpose filter. For rentals, ask about the deposit, notice period and repairs. For a purchase, arrange a viewing and obtain independent professional review of property documents.",
    question: "Are advertised house prices final?",
    answer:
      "An advertised price is the owner's asking price. Confirm what is included and get the complete proposed terms directly from the owner before making a commitment.",
  },
  Cabana: {
    intro:
      "Find cabanas for coastal breaks and quieter outdoor stays in Sri Lanka. Compare sleeping arrangements, location and access to everyday facilities.",
    check:
      "Check whether the bathroom is attached, how the room is ventilated and whether meals are offered nearby. Ask about the final approach, parking, lighting and any shared outdoor areas.",
    question: "What should I ask before choosing a cabana?",
    answer:
      "Confirm the number and type of beds, bathroom arrangement, check-in times and access during your travel dates. Describe any accessibility needs to the host before arranging a stay.",
  },
  Hotel: {
    intro:
      "Compare hotels in Sri Lanka by location, room facilities and the needs of your trip. Check listing details before asking about specific dates.",
    check:
      "Ask which room category the price describes, whether breakfast is included and how extra guests are charged. Confirm check-in and check-out times, parking and cancellation terms.",
    question: "Does an available listing confirm a hotel reservation?",
    answer:
      "No. Availability on Ceylon is supplied by the listing owner. Contact the hotel to confirm a room and agree to the booking terms directly.",
  },
  Room: {
    intro:
      "Explore rooms for rent and short stays in Sri Lanka. Compare private space, shared facilities and pricing periods to find an arrangement that suits your routine.",
    check:
      "Ask whether the bathroom and kitchen are shared, how bills are divided and which furnishings are supplied. For shared accommodation with occupancy preferences, also browse boarding houses.",
    question: "How is a room listing different from a boarding listing?",
    answer:
      "Boarding listings include structured tenant preferences, people per room and available spaces. General room listings can describe different rental or stay arrangements; confirm the details with the owner.",
  },
  Annex: {
    intro:
      "Find annexes for rent in Sri Lanka, from compact spaces for one person to arrangements suitable for couples. Compare privacy, facilities and the total monthly cost.",
    check:
      "Confirm whether there is a separate entrance, a private bathroom and a usable kitchen. Ask about parking, visitors, utility meters and access to the main property.",
    question: "What costs should I compare when renting an annex?",
    answer:
      "Compare the rent, deposit, water, electricity, internet and any shared service charges. Clarify the notice period and how the deposit will be handled in the written arrangement.",
  },
  "Day out": {
    intro:
      "Discover day-out locations in Sri Lanka for families, couples and workplace groups. Compare facilities, group sizes and the time included in each offer.",
    check:
      "Ask which meals and activities are included, whether the pool is shared and what facilities are available if it rains. Confirm children's pricing, changing rooms and any advance reservation requirement.",
    question: "Is the day-out price per person or per group?",
    answer:
      "Check the unit beside each price. Request a total for your group, including meals, activities and any minimum headcount, before confirming your visit.",
  },
  Land: {
    intro:
      "Browse land listings in Sri Lanka and compare the stated location and asking price. Arrange an inspection and independent checks before considering a purchase.",
    check:
      "Ask the owner for the plot extent, boundary information, access route and available utilities. Have relevant ownership and land-use documents reviewed by qualified local professionals.",
    question: "Does listing approval verify a land title?",
    answer:
      "No. Platform moderation does not certify ownership, boundaries, permitted use or value. A listing is a starting point for your own independent checks.",
  },
  Commercial: {
    intro:
      "Explore commercial spaces in Sri Lanka for work, storage, retail or other business needs. Compare usable space, access and rental or purchase terms.",
    check:
      "Explain your intended activity to the owner. Confirm loading access, parking, utility capacity, signage rules, maintenance responsibilities and any restrictions on the premises.",
    question: "Can any business use an advertised commercial space?",
    answer:
      "Do not assume so. Confirm the owner's terms and obtain appropriate local advice about permissions for your intended activity before committing.",
  },
  "Guest house": {
    intro:
      "Discover guest houses in Sri Lanka for simple overnight stops and longer local stays. Compare rooms, shared spaces and the details that matter to your journey.",
    check:
      "Check whether bathrooms are private, if breakfast is available and who to contact on arrival. Ask about luggage storage, transport and quiet hours when planning your stay.",
    question: "Are guest-house facilities always private?",
    answer:
      "No. Kitchens, lounges, gardens and bathrooms may be shared. Read the description and ask which facilities belong exclusively to your room.",
  },
  "Holiday home": {
    intro:
      "Browse holiday homes in Sri Lanka for family breaks and time away with friends. Compare the layout, location and facilities for your group.",
    check:
      "Ask for the bed arrangement rather than relying only on maximum guest capacity. Confirm cooking equipment, linen, parking and whether any part of the property remains occupied.",
    question: "What should a holiday-home quote include?",
    answer:
      "Request the total for your dates and guest count, including cleaning, extra beds, meals and any deposit. Confirm the cancellation and checkout arrangements in writing.",
  },
  Resort: {
    intro:
      "Explore resorts in Sri Lanka for stays built around shared facilities, meals and time outdoors. Compare what each advertised room or package actually includes.",
    check:
      "Confirm access to pools, activities and restaurants, including opening times and extra charges. Ask about group suitability, accessibility and alternatives if weather affects outdoor plans.",
    question: "Does a resort stay include all activities?",
    answer:
      "Only the activities stated in your agreed package are included. Ask the resort for an itemized quote and check whether activities require advance reservations.",
  },
  Restaurant: {
    intro:
      "Find restaurant listings in Sri Lanka for meals, celebrations and group gatherings. Compare the location and facilities before discussing your occasion.",
    check:
      "Ask about group seating, dietary needs, menu availability, parking and accessibility. For an event, confirm the minimum spend, duration and any private-area charges.",
    question: "Can I reserve a table through Ceylon?",
    answer:
      "Ceylon provides discovery and inquiries. Contact the restaurant directly to confirm a table, menu and any deposit or cancellation terms.",
  },
  "Event venue": {
    intro:
      "Explore event venues in Sri Lanka for celebrations, meetings and group occasions. Compare layouts and facilities against your event requirements.",
    check:
      "Distinguish seated capacity from standing capacity. Ask about catering, sound, parking, setup time, accessibility, backup power and the available indoor plan.",
    question: "What information helps a venue prepare a quote?",
    answer:
      "Share the date, guest count, event duration, seating layout and catering needs. Request a quote showing the hire fee, included services and optional charges.",
  },
  Service: {
    intro:
      "Browse services connected with places, stays and local experiences in Sri Lanka. Compare the stated scope and contact the provider about your specific requirements.",
    check:
      "Describe the task clearly and ask for the work included, timing, travel costs and cancellation terms. Request relevant evidence for specialist claims before choosing a provider.",
    question: "Does an advertised service price cover every request?",
    answer:
      "The stated price may describe a particular package. Confirm the scope and total directly with the provider before agreeing to work.",
  },
};
export function discoveryContent(filters: SearchFilters) {
  const c = categoryContent[filters.category || ""];
  const location = locations.find((l) => l.city === filters.city);
  const audience =
    boardingAudiences[filters.audience as keyof typeof boardingAudiences];
  return {
    title:
      filters.category === "Boarding"
        ? `Choosing a boarding room${audience ? ` for ${audience.toLowerCase()}` : ""}${filters.city ? ` in ${filters.city}` : ""}`
        : `Before you choose${filters.category ? ` a ${filters.category.toLowerCase()}` : " your place"}`,
    intro:
      c?.intro ||
      "Compare homes, stays and places to gather using a consistent pricing period and your everyday needs. Read each description and confirm the details directly with the owner.",
    check:
      c?.check ||
      "Shortlist by location, check the journey you will make most often, and compare the facilities you will actually use. Ask which parts of the property are private, what is shared and what costs extra.",
    local: location?.description,
    question: c?.question || "How should I confirm availability?",
    answer:
      c?.answer ||
      "Contact the owner with your dates and group size. Ask for current availability, the full price and the terms before making arrangements. Ceylon does not process bookings or payments.",
  };
}
