export interface BDDistrict {
  id: string;
  name: string;
  banglaName: string;
  division: string;
  isKhulna: boolean;
  deliveryDays: string;
}

export const ALL_64_DISTRICTS: BDDistrict[] = [
  // Khulna Division (Home Base - 24-48 Hours Express)
  { id: 'khulna', name: 'Khulna', banglaName: 'খুলনা', division: 'Khulna', isKhulna: true, deliveryDays: '24-48 Hours' },
  { id: 'bagerhat', name: 'Bagerhat', banglaName: 'বাগেরহাট', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'chuadanga', name: 'Chuadanga', banglaName: 'চুয়াডাঙ্গা', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'jessore', name: 'Jashore (Jessore)', banglaName: 'যশোর', division: 'Khulna', isKhulna: false, deliveryDays: '1-2 Days' },
  { id: 'jhenaidah', name: 'Jhenaidah', banglaName: 'ঝিনাইদহ', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'kushtia', name: 'Kushtia', banglaName: 'কুষ্টিয়া', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'magura', name: 'Magura', banglaName: 'মাগুরা', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'meherpur', name: 'Meherpur', banglaName: 'মেহেরপুর', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'narail', name: 'Narail', banglaName: 'নড়াইল', division: 'Khulna', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'satkhira', name: 'Satkhira', banglaName: 'সাতক্ষীরা', division: 'Khulna', isKhulna: false, deliveryDays: '1-2 Days' },

  // Dhaka Division
  { id: 'dhaka', name: 'Dhaka City', banglaName: 'ঢাকা', division: 'Dhaka', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'gazipur', name: 'Gazipur', banglaName: 'গাজীপুর', division: 'Dhaka', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'narayanganj', name: 'Narayanganj', banglaName: 'নারায়ণগঞ্জ', division: 'Dhaka', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'tangail', name: 'Tangail', banglaName: 'টাঙ্গাইল', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'kishoreganj', name: 'Kishoreganj', banglaName: 'কিশোরগঞ্জ', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'manikganj', name: 'Manikganj', banglaName: 'মানিকগঞ্জ', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'munshiganj', name: 'Munshiganj', banglaName: 'মুন্সীগঞ্জ', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'narsingdi', name: 'Narsingdi', banglaName: 'নরসিংদী', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'faridpur', name: 'Faridpur', banglaName: 'ফরিদপুর', division: 'Dhaka', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'gopalganj', name: 'Gopalganj', banglaName: 'গোপালগঞ্জ', division: 'Dhaka', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'madaripur', name: 'Madaripur', banglaName: 'মাদারীপুর', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'rajbari', name: 'Rajbari', banglaName: 'রাজবাড়ী', division: 'Dhaka', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'shariatpur', name: 'Shariatpur', banglaName: 'শরীয়তপুর', division: 'Dhaka', isKhulna: false, deliveryDays: '2-4 Days' },

  // Chattogram Division
  { id: 'chattogram', name: 'Chattogram', banglaName: 'চট্টগ্রাম', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'coxsbazar', name: "Cox's Bazar", banglaName: 'কক্সবাজার', division: 'Chattogram', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'cumilla', name: 'Cumilla', banglaName: 'কুমিল্লা', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'feni', name: 'Feni', banglaName: 'ফেনী', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'brahmanbaria', name: 'Brahmanbaria', banglaName: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'chandpur', name: 'Chandpur', banglaName: 'চাঁদপুর', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'noakhali', name: 'Noakhali', banglaName: 'নোয়াখালী', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'lakshmipur', name: 'Lakshmipur', banglaName: 'লক্ষ্মীপুর', division: 'Chattogram', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'rangamati', name: 'Rangamati', banglaName: 'রাঙ্গামাটি', division: 'Chattogram', isKhulna: false, deliveryDays: '3-5 Days' },
  { id: 'bandarban', name: 'Bandarban', banglaName: 'বান্দরবান', division: 'Chattogram', isKhulna: false, deliveryDays: '3-5 Days' },
  { id: 'khagrachhari', name: 'Khagrachhari', banglaName: 'খাগড়াছড়ি', division: 'Chattogram', isKhulna: false, deliveryDays: '3-5 Days' },

  // Rajshahi Division
  { id: 'rajshahi', name: 'Rajshahi', banglaName: 'রাজশাহী', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'bogura', name: 'Bogura (Bogra)', banglaName: 'বগুড়া', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'pabna', name: 'Pabna', banglaName: 'পাবনা', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-3 Days' },
  { id: 'sirajganj', name: 'Sirajganj', banglaName: 'সিরাজগঞ্জ', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'natore', name: 'Natore', banglaName: 'নাটোর', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'naogaon', name: 'Naogaon', banglaName: 'নওগাঁ', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'joypurhat', name: 'Joypurhat', banglaName: 'জয়পুরহাট', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'chapainawabganj', name: 'Chapainawabganj', banglaName: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', isKhulna: false, deliveryDays: '2-4 Days' },

  // Rangpur Division
  { id: 'rangpur', name: 'Rangpur', banglaName: 'রংপুর', division: 'Rangpur', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'dinajpur', name: 'Dinajpur', banglaName: 'দিনাজপুর', division: 'Rangpur', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'gaibandha', name: 'Gaibandha', banglaName: 'গাইবান্ধা', division: 'Rangpur', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'kurigram', name: 'Kurigram', banglaName: 'কুড়িগ্রাম', division: 'Rangpur', isKhulna: false, deliveryDays: '3-5 Days' },
  { id: 'lalmonirhat', name: 'Lalmonirhat', banglaName: 'লালমনিরহাট', division: 'Rangpur', isKhulna: false, deliveryDays: '3-5 Days' },
  { id: 'nilphamari', name: 'Nilphamari', banglaName: 'নীলফামারী', division: 'Rangpur', isKhulna: false, deliveryDays: '3-5 Days' },
  { id: 'panchagarh', name: 'Panchagarh', banglaName: 'পঞ্চগড়', division: 'Rangpur', isKhulna: false, deliveryDays: '3-5 Days' },
  { id: 'thakurgaon', name: 'Thakurgaon', banglaName: 'ঠাকুরগাঁও', division: 'Rangpur', isKhulna: false, deliveryDays: '3-5 Days' },

  // Sylhet Division
  { id: 'sylhet', name: 'Sylhet', banglaName: 'সিলেট', division: 'Sylhet', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'moulvibazar', name: 'Moulvibazar', banglaName: 'মৌলভীবাজার', division: 'Sylhet', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'habiganj', name: 'Habiganj', banglaName: 'হবিগঞ্জ', division: 'Sylhet', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'sunamganj', name: 'Sunamganj', banglaName: 'সুনামগঞ্জ', division: 'Sylhet', isKhulna: false, deliveryDays: '3-5 Days' },

  // Barishal Division
  { id: 'barishal', name: 'Barishal', banglaName: 'বরিশাল', division: 'Barishal', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'barguna', name: 'Barguna', banglaName: 'বরগুনা', division: 'Barishal', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'bhola', name: 'Bhola', banglaName: 'ভোলা', division: 'Barishal', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'jhalokathi', name: 'Jhalokathi', banglaName: 'ঝালকাঠি', division: 'Barishal', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'patuakhali', name: 'Patuakhali', banglaName: 'পটুয়াখালী', division: 'Barishal', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'pirojpur', name: 'Pirojpur', banglaName: 'পিরোজপুর', division: 'Barishal', isKhulna: false, deliveryDays: '2-4 Days' },

  // Mymensingh Division
  { id: 'mymensingh', name: 'Mymensingh', banglaName: 'ময়মনসিংহ', division: 'Mymensingh', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'jamalpur', name: 'Jamalpur', banglaName: 'জামালপুর', division: 'Mymensingh', isKhulna: false, deliveryDays: '2-4 Days' },
  { id: 'netrokona', name: 'Netrokona', banglaName: 'নেত্রকোণা', division: 'Mymensingh', isKhulna: false, deliveryDays: '3-4 Days' },
  { id: 'sherpur', name: 'Sherpur', banglaName: 'শেরপুর', division: 'Mymensingh', isKhulna: false, deliveryDays: '3-4 Days' },
];

export const getDeliveryFeeForDistrict = (districtName: string): number => {
  const norm = districtName.toLowerCase().trim();
  if (norm.includes('khulna')) return 60;
  return 120; // All other 63 districts nationwide flat rate
};
