import type { Stat, Story } from "@/components/home/editorial";
import { COMPANY, FLEET_VEHICLES, PARTNERS, SERVICE_AREA_GROUPS } from "@/lib/site-data";

/*
 * Page-specific content for the shared editorial sections (StatsBand,
 * ServiceStories). Figures come from site data or published policy only:
 * 60 minutes of complimentary airport waiting (AIRPORT_WAIT_POLICY), the
 * fleet list, the service-area list and the partner list.
 */

const CITY_COUNT = SERVICE_AREA_GROUPS.reduce((n, g) => n + g.cities.length, 0);
const AIRLINES = PARTNERS.filter((p) => p.kind === "airline").length;

export const AIRPORT_STATS: Stat[] = [
  { value: 60, suffix: " min", label: "Complimentary waiting time on airport pickups" },
  { value: 2, label: "Airports covered: DFW International and Dallas Love Field" },
  { value: 24, suffix: "/7", label: "Pickups for early departures and late arrivals" },
  { value: AIRLINES, label: "Airline partners" },
];

export const AIRPORT_STEPS: Story[] = [
  {
    title: "Share your flight",
    copy: "Add your flight number when you book. We monitor it, so an early landing or a delay moves your pickup with it.",
    imageKey: "airport",
  },
  {
    title: "Meet at baggage claim",
    copy: "Choose meet-and-greet and your chauffeur waits for you inside, then takes care of the luggage.",
    imageKey: "blogMeetGreet",
  },
  {
    title: "An hour, on us",
    copy: "Airport pickups include 60 minutes of complimentary waiting time for customs, bags and delays.",
    imageKey: "airportGateway",
  },
  {
    title: "Straight to the door",
    copy: "From DFW or Love Field to any address across Dallas–Fort Worth, in a sedan, SUV, Sprinter or coach.",
    imageKey: "blogLoveField",
  },
];

export const CORPORATE_STORIES: Story[] = [
  {
    title: "Roadshows and site visits",
    copy: "A chauffeur and vehicle for the day, timed to every meeting on the schedule.",
    imageKey: "corporateStory",
  },
  {
    title: "VIP guests and delegations",
    copy: "Arrivals handled from the airport to the hotel, with Sprinters and coaches for larger groups.",
    imageKey: "corporate",
  },
  {
    title: "A cabin for working",
    copy: "Quiet, prepared S-Class and Escalade cabins with privacy for calls between meetings.",
    imageKey: "chauffeurInterior",
  },
  {
    title: "One account, one invoice",
    copy: "Consolidated billing for your company's rides, with one point of contact for every booking.",
    imageKey: "blogCorporate",
  },
];

export const EVENT_STORIES: Story[] = [
  {
    title: "Weddings",
    copy: "The wedding party and guests moved on schedule, from the ceremony to the reception.",
    imageKey: "blogEvents",
  },
  {
    title: "Stadium and concert nights",
    copy: "Drop-off and pickup planned around the crowd, so the night ends without the parking lot.",
    imageKey: "events",
  },
  {
    title: "Galas and private occasions",
    copy: "Door-to-door arrivals with formal presentation and a chauffeur who knows the venue.",
    imageKey: "chauffeur",
  },
  {
    title: "Conventions and groups",
    copy: "Sprinters and coaches coordinated for delegations, teams and conference shuttles.",
    imageKey: "groupCoachStory",
  },
];

const LARGEST = Math.max(
  ...FLEET_VEHICLES.map((v) => Number(String(v.pax).replace(/\D/g, "")) || 0),
);

export const FLEET_STATS: Stat[] = [
  { value: FLEET_VEHICLES.length, label: "Vehicle classes, sedan to motor coach" },
  { value: LARGEST, label: "Seats in our largest motor coach" },
  { value: 95, prefix: "$", label: "Executive Sedan rides start from" },
  { value: 24, suffix: "/7", label: "Dispatch, every day of the year" },
];

export const ABOUT_STATS: Stat[] = [
  { value: COMPANY.foundedYear, label: "Founded in Dallas–Fort Worth" },
  { value: CITY_COUNT, label: "Communities served across the Metroplex" },
  { value: FLEET_VEHICLES.length, label: "Vehicle classes in the fleet" },
  { value: PARTNERS.length, label: "Airline and corporate partners" },
];
