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
  
  { roomType: 'Single', roomNumber: '110', name: 'Mahesh Waran', phoneNo: '9671453457', joiningDate: '15/07/2025', rent: 15000, rentPaid: 0, rentUnpaid: 15000, securityPaid: 15000, securityUnpaid: 0, lastReading: 6489, currentReading: 0, electricityPaid: false, noticeGiven: false, vacantDate: '' },
  
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