export interface TenantData {
  roomType: string;
  roomNumber: string;
  name: string;
  phoneNo: string;
  joiningDate: string;
  rent: number;
  rentPaid: number;
  rentUnpaid: number;
  securityPaid: number;
  securityUnpaid: number;
  lastReading: number;
  currentReading: number;
  electricityPaid: boolean;
  noticeGiven: boolean;
  vacantDate: string;
}

export const tenantData: TenantData[] = [
  // Ground Floor
  { roomType: 'Triple', roomNumber: 'G001', name: 'Tanish Bist', phoneNo: '7906458557', joiningDate: '20-07-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 2000, securityUnpaid: 1000, lastReading: 0, currentReading: 7588, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: 'G001', name: 'Jasmine', phoneNo: '8273506262', joiningDate: '20-07-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 2000, securityUnpaid: 1000, lastReading: 0, currentReading: 7588, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: 'G001', name: 'sheetal', phoneNo: '7820023981', joiningDate: '20-07-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 2000, securityUnpaid: 1000, lastReading: 0, currentReading: 7588, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '101', name: 'ABHAY', phoneNo: '7982902494', joiningDate: '11-06-2025', rent: 7000, rentPaid: 0, rentUnpaid: 7000, securityPaid: 10000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '101', name: 'DAISY KRISHNA', phoneNo: '9588172468', joiningDate: '01-01-2024', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '101', name: 'SHRESTH GAHLOT', phoneNo: '9785616505', joiningDate: '06-02-2024', rent: 10500, rentPaid: 0, rentUnpaid: 10500, securityPaid: 10000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '102', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '102', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '102', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '103', name: 'KAUSTAV GHOSH', phoneNo: '7980414688', joiningDate: '05-01-2025', rent: 10500, rentPaid: 0, rentUnpaid: 10500, securityPaid: 10500, securityUnpaid: 0, lastReading: 8795, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '103', name: 'Ritik Singh', phoneNo: '8318418690', joiningDate: '28-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8000, securityUnpaid: 4000, lastReading: 9260, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '104', name: 'NIPUN TANK', phoneNo: '9462492390', joiningDate: '30-06-2025', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 16000, securityUnpaid: 0, lastReading: 6741, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '105', name: 'DOLLY', phoneNo: '9811933527', joiningDate: '20-05-2024', rent: 13000, rentPaid: 0, rentUnpaid: 13000, securityPaid: 13000, securityUnpaid: 0, lastReading: 6122, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '106', name: 'Vijeet Nigam', phoneNo: '9408906385', joiningDate: '1/1/2024', rent: 15500, rentPaid: 0, rentUnpaid: 15500, securityPaid: 15500, securityUnpaid: 0, lastReading: 3870, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '107', name: 'SHIV NANDAN', phoneNo: '8429721303', joiningDate: '01-01-2025', rent: 10000, rentPaid: 0, rentUnpaid: 10000, securityPaid: 0, securityUnpaid: 0, lastReading: 785, currentReading: 1428, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '107', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '108', name: 'SUMAN DAS', phoneNo: '8448949159', joiningDate: '12-11-2022', rent: 15900, rentPaid: 0, rentUnpaid: 15900, securityPaid: 0, securityUnpaid: 0, lastReading: 2982, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '109', name: 'ANIL SINGLA', phoneNo: '9872811589', joiningDate: '31-03-2025', rent: 9000, rentPaid: 0, rentUnpaid: 9000, securityPaid: 0, securityUnpaid: 0, lastReading: 5432, currentReading: 2098, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '109', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '110', name: 'Mahesh Waran', phoneNo: '9671453457', joiningDate: '15/07/2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 15000, lastReading: 6489, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '111', name: 'PRANJAL TARIYAL', phoneNo: '9193375623', joiningDate: '08-10-2025', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 4750, securityUnpaid: 0, lastReading: 4679, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '111', name: 'ARYAN', phoneNo: '8708407492', joiningDate: '08-10-2024', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 4750, securityUnpaid: 0, lastReading: 4679, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '112', name: 'PRIYANSH', phoneNo: '9776319855', joiningDate: '15-06-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 0, lastReading: 3178, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '113', name: 'PRACHI', phoneNo: '9454510749', joiningDate: '01-11-2021', rent: 10200, rentPaid: 0, rentUnpaid: 10200, securityPaid: 4950, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '113', name: 'D.R KRISHNA', phoneNo: '8397094046', joiningDate: '01-11-2021', rent: 10200, rentPaid: 0, rentUnpaid: 10200, securityPaid: 10200, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '114', name: 'ANISH KUMAR', phoneNo: '9546257643', joiningDate: '01-07-2025', rent: 16200, rentPaid: 0, rentUnpaid: 16200, securityPaid: 16200, securityUnpaid: 0, lastReading: 2653, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '115', name: 'DHANANJAY KUMAR', phoneNo: '9560215335', joiningDate: '25-02-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 0, lastReading: 5257, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '116', name: 'SURYABHAN YADAV', phoneNo: '8920199108', joiningDate: '01-08-2025', rent: 15800, rentPaid: 0, rentUnpaid: 15800, securityPaid: 15800, securityUnpaid: 0, lastReading: 8663, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '117', name: 'VISHAL M', phoneNo: '8870866151', joiningDate: '12-10-2024', rent: 9200, rentPaid: 0, rentUnpaid: 9200, securityPaid: 4500, securityUnpaid: 0, lastReading: 8053, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '117', name: 'ANIKET', phoneNo: '8870866151', joiningDate: '25-07-2025', rent: 7200, rentPaid: 0, rentUnpaid: 7200, securityPaid: 4500, securityUnpaid: 0, lastReading: 8053, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '117', name: 'DESIGNAR', phoneNo: '7092098767', joiningDate: '01-01-2024', rent: 9200, rentPaid: 0, rentUnpaid: 9200, securityPaid: 4500, securityUnpaid: 0, lastReading: 7419, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '118', name: 'ANSHUMAN SINGH', phoneNo: '', joiningDate: '01-08-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 7500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '118', name: 'KAUSHAL SINGH CHAUHAN', phoneNo: '', joiningDate: '01-08-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 7500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '118', name: 'HIMANSHU ANAND', phoneNo: '', joiningDate: '01-08-2025', rent: 7500, rentPaid: 2000, rentUnpaid: 5500, securityPaid: 7500, securityUnpaid: 13000, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '119', name: 'POOJA KUMARI', phoneNo: '8529581175', joiningDate: '01-02-2025', rent: 17000, rentPaid: 0, rentUnpaid: 17000, securityPaid: 17000, securityUnpaid: 0, lastReading: 11027, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  // Floor 2
  { roomType: 'Triple', roomNumber: '201', name: 'SHIVANGI SAHU', phoneNo: '7007225230', joiningDate: '11-03-2025', rent: 8200, rentPaid: 0, rentUnpaid: 8200, securityPaid: 8200, securityUnpaid: 0, lastReading: 11713, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '201', name: 'PRIYA GOYAL', phoneNo: '8766344735', joiningDate: '14-03-2024', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '201', name: 'DHRITI SHARMA', phoneNo: '7017288218', joiningDate: '04-01-2024', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 0, securityUnpaid: 0, lastReading: 11713, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '202', name: 'Sahil', phoneNo: '7082634926', joiningDate: '01-05-2023', rent: 6200, rentPaid: 0, rentUnpaid: 6200, securityPaid: 8500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '202', name: 'CHIRAG BANSAL', phoneNo: '9996718848', joiningDate: '01-09-2023', rent: 6500, rentPaid: 0, rentUnpaid: 6500, securityPaid: 9900, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '202', name: 'SACHIN RAIKWAR', phoneNo: '7705886228', joiningDate: '14-05-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 4092, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '203', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '28-08-2025' },
  { roomType: 'Double', roomNumber: '203', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '28-08-2025' },
  
  { roomType: 'Double', roomNumber: '204', name: 'RASHI GUPTA', phoneNo: '6387204040', joiningDate: '02-06-2024', rent: 10500, rentPaid: 0, rentUnpaid: 10500, securityPaid: 10500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '204', name: 'ARUSHI', phoneNo: '7903424548', joiningDate: '05-07-2025', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 9500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '205', name: 'MEGHA', phoneNo: '9773934690', joiningDate: '11-01-2021', rent: 14000, rentPaid: 0, rentUnpaid: 14000, securityPaid: 14000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '206', name: 'PRIYANSHI', phoneNo: '9410216649', joiningDate: '01-01-2024', rent: 13200, rentPaid: 0, rentUnpaid: 13200, securityPaid: 0, securityUnpaid: 5180, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '207', name: 'ADITYA', phoneNo: '7900465446', joiningDate: '30-01-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 0, lastReading: 4174, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '207', name: 'RAJEEV SINGH', phoneNo: '8368535311', joiningDate: '11-01-2024', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 0, lastReading: 4174, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '208', name: 'SHIVAM KUMAR', phoneNo: '7483383270', joiningDate: '15-06-2025', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 9500, securityUnpaid: 5000, lastReading: 4070, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '208', name: 'Aman', phoneNo: '9546627408', joiningDate: '01-02-2024', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 4500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '209', name: 'HARSHIT KUMAR', phoneNo: '6394220519', joiningDate: '02-01-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 0, lastReading: 3202, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '210', name: 'SRI KRISHANA', phoneNo: '8056701270', joiningDate: '01-01-2024', rent: 16200, rentPaid: 0, rentUnpaid: 16200, securityPaid: 16200, securityUnpaid: 0, lastReading: 4691, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '211', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '02-08-2025' },
  { roomType: 'Double', roomNumber: '211', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '02-08-2025' },
  
  { roomType: 'Double', roomNumber: '212', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '13-08-2025' },
  { roomType: 'Double', roomNumber: '212', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '13-08-2025' },
  
  { roomType: 'Single', roomNumber: '213', name: 'SHUBHAM', phoneNo: '8299349153', joiningDate: '25-05-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 10000, securityUnpaid: 0, lastReading: 5518, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '214', name: 'RAHUL RANGAR', phoneNo: '9760187038', joiningDate: '05-02-2025', rent: 10000, rentPaid: 0, rentUnpaid: 10000, securityPaid: 10000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '214', name: 'KULDEEP CHOUDHARY', phoneNo: '9761560469', joiningDate: '18-09-2023', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 7500, securityUnpaid: 0, lastReading: 8049, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '215', name: 'YATI SINGH', phoneNo: '8532893952', joiningDate: '29-06-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 0, lastReading: 3614, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '216', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '11-08-2025' },
  { roomType: 'Double', roomNumber: '216', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '11-08-2025' },
  
  { roomType: 'Triple', roomNumber: '217', name: 'SHIVAM VARMA', phoneNo: '7895160566', joiningDate: '01-01-2024', rent: 6200, rentPaid: 0, rentUnpaid: 6200, securityPaid: 8900, securityUnpaid: 0, lastReading: 7780, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '217', name: 'SAGAR SINGH', phoneNo: '9510933750', joiningDate: '05-10-2024', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 8000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '217', name: 'AVINESH KUMAR', phoneNo: '9306442318', joiningDate: '21-06-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 8000, securityUnpaid: 0, lastReading: 8019, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '218', name: 'PRIYA BHATT', phoneNo: '9555069116', joiningDate: '09-08-2023', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 6500, securityUnpaid: 0, lastReading: 11008, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '218', name: 'MUSKAN', phoneNo: '7303575456', joiningDate: '10-04-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 9500, securityUnpaid: 0, lastReading: 11008, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '218', name: 'SHAMBHAVI', phoneNo: '9304622497', joiningDate: '30-06-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 8000, securityUnpaid: 0, lastReading: 11008, currentReading: 0, electricityPaid: true, noticeGiven: true, vacantDate: '30-08-2025' },
  
  { roomType: 'Double', roomNumber: '219', name: 'AMAN SINGH', phoneNo: '6388699606', joiningDate: '09-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '219', name: 'JATIN KUMAR', phoneNo: '7017371834', joiningDate: '26-06-2025', rent: 10000, rentPaid: 0, rentUnpaid: 10000, securityPaid: 5000, securityUnpaid: 0, lastReading: 4810, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  // Floor 3
  { roomType: 'Triple', roomNumber: '301', name: 'NITU TIWARI', phoneNo: '9140731851', joiningDate: '08-05-2025', rent: 7500, rentPaid: 0, rentUnpaid: 7500, securityPaid: 7500, securityUnpaid: 0, lastReading: 1595, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '301', name: 'ANUSHKA', phoneNo: '7985553788', joiningDate: '18-10-2024', rent: 6500, rentPaid: 0, rentUnpaid: 6500, securityPaid: 8500, securityUnpaid: 0, lastReading: 2051, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '301', name: 'SONAM CHOUDHARY', phoneNo: '7037262167', joiningDate: '21-09-2024', rent: 6500, rentPaid: 0, rentUnpaid: 6500, securityPaid: 0, securityUnpaid: 0, lastReading: 2051, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '302', name: 'HIMANSHU', phoneNo: '9467777922', joiningDate: '01-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 1278, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '302', name: 'RISHABH', phoneNo: '9467777922', joiningDate: '01-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 1278, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '302', name: 'DEVENDER', phoneNo: '9467777922', joiningDate: '01-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 1278, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '303', name: 'PRADYUM', phoneNo: '9761019937', joiningDate: '05-01-2024', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 9500, securityUnpaid: 0, lastReading: 900, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '303', name: 'SHASHANK SHUKLA', phoneNo: '9670279135', joiningDate: '28-07-2025', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 9500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '304', name: 'ANKIT CHOUDHARY', phoneNo: '9113770092', joiningDate: '03-01-2024', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 14000, securityUnpaid: 0, lastReading: 3175, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '305', name: 'BHAVIK', phoneNo: '9653352525', joiningDate: '15-07-2025', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 16000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '306', name: 'HIMANSHU', phoneNo: '8809952265', joiningDate: '01-01-2024', rent: 15500, rentPaid: 0, rentUnpaid: 15500, securityPaid: 15000, securityUnpaid: 0, lastReading: 3671, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '307', name: 'Ankit Sharma', phoneNo: '7357190898', joiningDate: '01-08-2025', rent: 15500, rentPaid: 0, rentUnpaid: 15500, securityPaid: 15500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '308', name: 'NIKHIL KUMAR', phoneNo: '9123885936', joiningDate: '16-06-2025', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 16000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '309', name: 'AMAN SRIVASTAVA', phoneNo: '7651941049', joiningDate: '01-02-2025', rent: 15500, rentPaid: 0, rentUnpaid: 15500, securityPaid: 15500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '310', name: 'KARTIK TAYAL', phoneNo: '8587975954', joiningDate: '01-11-2022', rent: 13200, rentPaid: 0, rentUnpaid: 13200, securityPaid: 15500, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '311', name: 'AKANKSHA SINGH', phoneNo: '7525887433', joiningDate: '15-01-2024', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 4713, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '311', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '312', name: 'ANISH KUMAR', phoneNo: '7309016666', joiningDate: '10-06-2024', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 0, securityUnpaid: 4400, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '313', name: 'PADMINI KUMARI', phoneNo: '8789162932', joiningDate: '05-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 6572, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '313', name: 'Gaurav', phoneNo: '', joiningDate: '05-06-2024', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 8500, securityUnpaid: 0, lastReading: 6572, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '314', name: 'PUJA KUMARI', phoneNo: '7739830917', joiningDate: '30-03-2025', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 16000, securityUnpaid: 0, lastReading: 6555, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '315', name: 'RAVI SHANKAR', phoneNo: '89188195019', joiningDate: '16-07-2023', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 0, securityUnpaid: 4509, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '316', name: 'Akashna', phoneNo: '8800170768', joiningDate: '03-07-2025', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '317', name: 'KIRTIPAL', phoneNo: '6377525835', joiningDate: '25-05-2025', rent: 9000, rentPaid: 0, rentUnpaid: 9000, securityPaid: 0, securityUnpaid: 8019, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '317', name: 'VIKASH TYAGI', phoneNo: '9634105681', joiningDate: '26-09-2024', rent: 6500, rentPaid: 0, rentUnpaid: 6500, securityPaid: 0, securityUnpaid: 8019, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '317', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '318', name: 'ARYAN GOYAL', phoneNo: '6367609001', joiningDate: '07-07-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '318', name: 'VIVEK', phoneNo: '9669667277', joiningDate: '09-06-2025', rent: 6500, rentPaid: 0, rentUnpaid: 6500, securityPaid: 0, securityUnpaid: 11441, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '318', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '319', name: 'TANUJA RAJE', phoneNo: '8869960442', joiningDate: '09-08-2023', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '09-08-2025' },
  { roomType: 'Triple', roomNumber: '319', name: 'MAIMA GARG', phoneNo: '7017257053', joiningDate: '10-03-2023', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 6529, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '319', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  // Floor 4
  { roomType: 'Triple', roomNumber: '401', name: 'ROHIT SENWER', phoneNo: '8318136798', joiningDate: '01-01-2024', rent: 6200, rentPaid: 0, rentUnpaid: 6200, securityPaid: 0, securityUnpaid: 9533, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '401', name: 'CHETAN PANT', phoneNo: '9528892298', joiningDate: '01-01-2024', rent: 6500, rentPaid: 0, rentUnpaid: 6500, securityPaid: 0, securityUnpaid: 9533, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '401', name: 'NIKIL', phoneNo: '8299415220', joiningDate: '12-03-2022', rent: 6200, rentPaid: 0, rentUnpaid: 6200, securityPaid: 0, securityUnpaid: 9533, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '402', name: 'PARSHANT', phoneNo: '8423270648', joiningDate: '01-02-2024', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 0, securityUnpaid: 1915, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '402', name: 'PANKAJ KUMAR', phoneNo: '7033397085', joiningDate: '02-07-2025', rent: 8500, rentPaid: 0, rentUnpaid: 8500, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '402', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '403', name: 'ARYAN', phoneNo: '7084015303', joiningDate: '05-04-2025', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 0, securityUnpaid: 5890, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '403', name: 'AISHWARYA', phoneNo: '7084015303', joiningDate: '05-04-2025', rent: 9500, rentPaid: 0, rentUnpaid: 9500, securityPaid: 0, securityUnpaid: 5890, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '404', name: 'ASHISH PRATHAP', phoneNo: '9997471023', joiningDate: '01-01-2024', rent: 15300, rentPaid: 0, rentUnpaid: 15300, securityPaid: 0, securityUnpaid: 3491, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '405', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '405', name: 'MOHIT KUMAR', phoneNo: '7454933124', joiningDate: '22-03-2025', rent: 16000, rentPaid: 0, rentUnpaid: 16000, securityPaid: 0, securityUnpaid: 1322, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '406', name: 'SIDDHART', phoneNo: '8721082742', joiningDate: '13-04-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 0, securityUnpaid: 3421, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '407', name: 'SIDHANT SHARMA', phoneNo: '8550043773', joiningDate: '21-06-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 0, securityUnpaid: 244, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '408', name: 'VIKASH VARMA', phoneNo: '9045360168', joiningDate: '01-12-2023', rent: 13500, rentPaid: 0, rentUnpaid: 13500, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '409', name: 'KRISHNA', phoneNo: '7240861072', joiningDate: '20-10-2024', rent: 16200, rentPaid: 0, rentUnpaid: 16200, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '410', name: 'GUDDETI SHRINIWASAN REDDY', phoneNo: '7291019963', joiningDate: '28-07-2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 7500, lastReading: 6489, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '411', name: 'YUVRAJ SINGH', phoneNo: '7500262481', joiningDate: '17-06-2025', rent: 10000, rentPaid: 0, rentUnpaid: 10000, securityPaid: 10000, securityUnpaid: 0, lastReading: 4390, currentReading: 344, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '411', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '412', name: 'AMANDEEP SINGH', phoneNo: '9717558165', joiningDate: '06-10-2025', rent: 14500, rentPaid: 0, rentUnpaid: 14500, securityPaid: 14500, securityUnpaid: 0, lastReading: 3498, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '413', name: 'ASWAS GANGULY', phoneNo: '9051070815', joiningDate: '05-01-2023', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 0, lastReading: 654, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '414', name: 'BHRIGU PANT', phoneNo: '999767333', joiningDate: '05-11-2023', rent: 13500, rentPaid: 0, rentUnpaid: 13500, securityPaid: 13500, securityUnpaid: 0, lastReading: 4868, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '415', name: 'AYUSH GOYAL', phoneNo: '8826777414', joiningDate: '16-02-2023', rent: 12500, rentPaid: 0, rentUnpaid: 12500, securityPaid: 16000, securityUnpaid: 0, lastReading: 4178, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Single', roomNumber: '416', name: 'VAISHNAVI', phoneNo: '9354050289', joiningDate: '09-08-2023', rent: 13500, rentPaid: 0, rentUnpaid: 13500, securityPaid: 15500, securityUnpaid: 0, lastReading: 4427, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '417', name: 'SHIVANI SINGH', phoneNo: '8349425617', joiningDate: '07-04-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '417', name: 'MEENAKSHI TIWARI', phoneNo: '9670025539', joiningDate: '05-07-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 2000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '417', name: 'AKANKSHA GUPTHA', phoneNo: '8957290074', joiningDate: '16-06-2025', rent: 8200, rentPaid: 0, rentUnpaid: 8200, securityPaid: 2000, securityUnpaid: 0, lastReading: 2304, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '418', name: 'SHAGUN', phoneNo: '9319422504', joiningDate: '07-01-2025', rent: 8000, rentPaid: 0, rentUnpaid: 8000, securityPaid: 1000, securityUnpaid: 0, lastReading: 6266, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '418', name: 'KHUSHI VARMA', phoneNo: '8081569878', joiningDate: '06-07-2025', rent: 8200, rentPaid: 0, rentUnpaid: 8200, securityPaid: 2000, securityUnpaid: 0, lastReading: 6266, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '418', name: 'Vacant', phoneNo: '', joiningDate: '', rent: 0, rentPaid: 0, rentUnpaid: 0, securityPaid: 0, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Double', roomNumber: '419', name: 'TANPREET KAUR', phoneNo: '8400758058', joiningDate: '10-06-2025', rent: 10500, rentPaid: 0, rentUnpaid: 10500, securityPaid: 10500, securityUnpaid: 0, lastReading: 8745, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Double', roomNumber: '419', name: 'JYOTI', phoneNo: '7908019023', joiningDate: '10-06-2025', rent: 10500, rentPaid: 0, rentUnpaid: 10500, securityPaid: 10500, securityUnpaid: 0, lastReading: 8745, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  // Floor 5
  { roomType: 'Single', roomNumber: '501', name: 'SHUBHAM VERMA', phoneNo: '997107116', joiningDate: '27-07-2025', rent: 15500, rentPaid: 0, rentUnpaid: 15500, securityPaid: 7500, securityUnpaid: 13000, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
  { roomType: 'Triple', roomNumber: '502', name: 'HARSH VARMA', phoneNo: '9340375798', joiningDate: '09-06-2025', rent: 7800, rentPaid: 0, rentUnpaid: 7800, securityPaid: 5000, securityUnpaid: 0, lastReading: 2178, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '502', name: 'KARTIK', phoneNo: '7985553788', joiningDate: '19-06-2025', rent: 7800, rentPaid: 0, rentUnpaid: 7800, securityPaid: 5000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  { roomType: 'Triple', roomNumber: '502', name: 'SHAIL SINGH', phoneNo: '7985553788', joiningDate: '19-06-2025', rent: 7800, rentPaid: 0, rentUnpaid: 7800, securityPaid: 5000, securityUnpaid: 0, lastReading: 0, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
];

// Helper function to get room statistics
export const getRoomStats = () => {
  const rooms = new Map();
  
  tenantData.forEach(tenant => {
    if (!rooms.has(tenant.roomNumber)) {
      rooms.set(tenant.roomNumber, {
        roomNumber: tenant.roomNumber,
        roomType: tenant.roomType,
        tenants: [],
        totalRent: 0,
        totalRentPaid: 0,
        totalRentUnpaid: 0,
        totalSecurityPaid: 0,
        totalSecurityUnpaid: 0,
        occupiedBeds: 0,
        totalBeds: getBedCount(tenant.roomType),
        hasNotice: false,
        hasUnpaidRent: false,
        hasUnpaidElectricity: false,
        lastReading: 0,
        currentReading: 0
      });
    }
    
    const room = rooms.get(tenant.roomNumber);
    if (tenant.name !== 'Vacant') {
      room.tenants.push(tenant);
      room.totalRent += tenant.rent;
      room.totalRentPaid += tenant.rentPaid;
      room.totalRentUnpaid += tenant.rentUnpaid;
      room.totalSecurityPaid += tenant.securityPaid;
      room.totalSecurityUnpaid += tenant.securityUnpaid;
      room.occupiedBeds += 1;
      room.hasNotice = room.hasNotice || tenant.noticeGiven;
      room.hasUnpaidRent = room.hasUnpaidRent || tenant.rentUnpaid > 0;
      room.hasUnpaidElectricity = room.hasUnpaidElectricity || !tenant.electricityPaid;
      room.lastReading = Math.max(room.lastReading, tenant.lastReading);
      room.currentReading = Math.max(room.currentReading, tenant.currentReading);
    }
  });
  
  return Array.from(rooms.values());
};

const getBedCount = (roomType: string) => {
  switch (roomType) {
    case 'Single': return 1;
    case 'Double': return 2;
    case 'Triple': return 3;
    default: return 1;
  }
}; 