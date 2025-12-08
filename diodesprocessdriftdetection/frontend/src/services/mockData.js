// Mock data based on the uploaded CSV files

const SUPPLIERS = [
  { supplier_id: "SUP-0000", supplier_name: "Advanced Systems 199", tier_level: 3, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "Specialty Chemical Production", supplies_id: "SUP-0099", latitude: 3.19252112638737, longitude: 101.70482000086629 },
  { supplier_id: "SUP-0001", supplier_name: "Asia Foundry 198", tier_level: 3, site_location_country: "Malaysia", site_location_city: "Penang", site_function: "Raw Material Extraction", supplies_id: "SUP-0063", latitude: 5.424909320425142, longitude: 100.34368537190814 },
  { supplier_id: "SUP-0002", supplier_name: "Global Devices 197", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Specialty Chemical Production", supplies_id: "SUP-0095", latitude: 38.312449182354655, longitude: 112.22077504969054 },
  { supplier_id: "SUP-0003", supplier_name: "Syn Materials 196", tier_level: 3, site_location_country: "Vietnam", site_location_city: "Ho Chi Minh City", site_function: "Specialty Chemical Production", supplies_id: "SUP-0142", latitude: 44.81990691318206, longitude: 93.41292601227865 },
  { supplier_id: "SUP-0004", supplier_name: "Auto Systems 195", tier_level: 3, site_location_country: "Japan", site_location_city: "Nagasaki", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0102", latitude: 29.170761822778037, longitude: 97.0652053801702 },
  { supplier_id: "SUP-0005", supplier_name: "Precision Fab 194", tier_level: 3, site_location_country: "USA", site_location_city: "Arizona", site_function: "Specialty Chemical Production", supplies_id: "SUP-0082", latitude: 33.378374930830255, longitude: -112.04336559746889 },
  { supplier_id: "SUP-0006", supplier_name: "Auto Tech 193", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Raw Material Extraction", supplies_id: "SUP-0073", latitude: 20.862739527433877, longitude: 117.28955459903824 },
  { supplier_id: "SUP-0007", supplier_name: "Precision Materials 192", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0100", latitude: 30.271198646628516, longitude: 98.55802174784354 },
  { supplier_id: "SUP-0008", supplier_name: "Precision Systems 191", tier_level: 3, site_location_country: "China", site_location_city: "Suzhou", site_function: "Raw Material Extraction", supplies_id: "SUP-0109", latitude: 36.93832846371702, longitude: 84.1793339782804 },
  { supplier_id: "SUP-0009", supplier_name: "Auto Logistics 190", tier_level: 3, site_location_country: "Vietnam", site_location_city: "Hanoi", site_function: "Specialty Chemical Production", supplies_id: "SUP-0065", latitude: 20.984420568709243, longitude: 105.88238773856165 },
  { supplier_id: "SUP-0010", supplier_name: "Poly Chem 189", tier_level: 3, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0128", latitude: 34.52448451560284, longitude: 102.15319796362263 },
  { supplier_id: "SUP-0011", supplier_name: "Advanced Corp 188", tier_level: 3, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Specialty Chemical Production", supplies_id: "SUP-0115", latitude: 23.37117453732214, longitude: 101.53137892084654 },
  { supplier_id: "SUP-0012", supplier_name: "Poly Systems 187", tier_level: 3, site_location_country: "Taiwan", site_location_city: "Taichung", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0100", latitude: 34.50806607344841, longitude: 113.33568061603502 },
  { supplier_id: "SUP-0013", supplier_name: "Poly Tech 186", tier_level: 3, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0098", latitude: 32.750283872403685, longitude: 130.68224679584407 },
  { supplier_id: "SUP-0014", supplier_name: "Asia Semi 185", tier_level: 3, site_location_country: "China", site_location_city: "Suzhou", site_function: "Specialty Chemical Production", supplies_id: "SUP-0101", latitude: 24.082668628907378, longitude: 92.67752118238683 },
  { supplier_id: "SUP-0015", supplier_name: "Auto Materials 184", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0076", latitude: 42.386465192036084, longitude: 88.82547434646864 },
  { supplier_id: "SUP-0016", supplier_name: "Innov Materials 183", tier_level: 3, site_location_country: "South Korea", site_location_city: "Yongin", site_function: "Specialty Chemical Production", supplies_id: "SUP-0146", latitude: 35.06911043399975, longitude: 121.58212522031235 },
  { supplier_id: "SUP-0017", supplier_name: "Asia Fab 182", tier_level: 3, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0132", latitude: 45.75667916799479, longitude: 82.19934556504005 },
  { supplier_id: "SUP-0018", supplier_name: "Precision Chem 181", tier_level: 3, site_location_country: "China", site_location_city: "Suzhou", site_function: "Raw Material Extraction", supplies_id: "SUP-0098", latitude: 45.87798034453916, longitude: 108.82985782915534 },
  { supplier_id: "SUP-0019", supplier_name: "Global Corp 180", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0137", latitude: 32.434990107109364, longitude: 85.72362226907902 },
  { supplier_id: "SUP-0020", supplier_name: "Innov Tech 179", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Specialty Chemical Production", supplies_id: "SUP-0116", latitude: 44.1060698119279, longitude: 110.99021711556028 },
  { supplier_id: "SUP-0021", supplier_name: "Innov Devices 178", tier_level: 3, site_location_country: "Japan", site_location_city: "Nagasaki", site_function: "Specialty Chemical Production", supplies_id: "SUP-0154", latitude: 22.592559733901087, longitude: 122.24199224839542 },
  { supplier_id: "SUP-0022", supplier_name: "Precision Foundry 177", tier_level: 3, site_location_country: "South Korea", site_location_city: "Cheonan", site_function: "Specialty Chemical Production", supplies_id: "SUP-0125", latitude: 36.772054912367174, longitude: 127.1179026562297 },
  { supplier_id: "SUP-0023", supplier_name: "Precision Semi 176", tier_level: 3, site_location_country: "Japan", site_location_city: "Nagasaki", site_function: "Specialty Chemical Production", supplies_id: "SUP-0071", latitude: 29.994155331702387, longitude: 88.32944073025205 },
  { supplier_id: "SUP-0024", supplier_name: "Asia Fab 175", tier_level: 3, site_location_country: "Malaysia", site_location_city: "Penang", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0099", latitude: 5.2998750530944765, longitude: 100.32547582113479 },
  { supplier_id: "SUP-0025", supplier_name: "Syn Tech 174", tier_level: 3, site_location_country: "South Korea", site_location_city: "Cheonan", site_function: "Raw Material Extraction", supplies_id: "SUP-0063", latitude: 36.757253769789344, longitude: 127.07928884365555 },
  { supplier_id: "SUP-0026", supplier_name: "Global Devices 173", tier_level: 3, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0158", latitude: 25.970197143828877, longitude: 110.15105106576205 },
  { supplier_id: "SUP-0027", supplier_name: "Syn Tech 172", tier_level: 3, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0133", latitude: 25.313207273420353, longitude: 118.69329362742741 },
  { supplier_id: "SUP-0028", supplier_name: "Innov Foundry 171", tier_level: 3, site_location_country: "South Korea", site_location_city: "Yongin", site_function: "Specialty Chemical Production", supplies_id: "SUP-0123", latitude: 42.88114533990959, longitude: 102.45816120643372 },
  { supplier_id: "SUP-0029", supplier_name: "Advanced Semi 170", tier_level: 3, site_location_country: "China", site_location_city: "Shanghai", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0148", latitude: 31.302849374966282, longitude: 121.49544348137995 },
  { supplier_id: "SUP-0030", supplier_name: "Advanced Fab 169", tier_level: 3, site_location_country: "Taiwan", site_location_city: "Hsinchu", site_function: "Specialty Chemical Production", supplies_id: "SUP-0088", latitude: 24.788441612767258, longitude: 120.9305640870278 },
  { supplier_id: "SUP-0031", supplier_name: "Syn Logistics 168", tier_level: 3, site_location_country: "South Korea", site_location_city: "Yongin", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0119", latitude: 28.241677401642733, longitude: 82.77068758077516 },
  { supplier_id: "SUP-0032", supplier_name: "Precision Semi 167", tier_level: 3, site_location_country: "Taiwan", site_location_city: "Tainan", site_function: "Raw Material Extraction", supplies_id: "SUP-0118", latitude: 23.066339326332624, longitude: 120.1353462002347 },
  { supplier_id: "SUP-0033", supplier_name: "Global Chem 166", tier_level: 3, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0127", latitude: 45.950502695440285, longitude: 122.76608213627131 },
  { supplier_id: "SUP-0034", supplier_name: "Syn Corp 165", tier_level: 3, site_location_country: "Germany", site_location_city: "Munich", site_function: "Specialty Chemical Production", supplies_id: "SUP-0138", latitude: 33.939713327271235, longitude: 107.79499392002657 },
  { supplier_id: "SUP-0035", supplier_name: "Global Materials 164", tier_level: 3, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0117", latitude: 3.170367490929722, longitude: 101.65430535257609 },
  { supplier_id: "SUP-0036", supplier_name: "Innov Semi 163", tier_level: 3, site_location_country: "Vietnam", site_location_city: "Ho Chi Minh City", site_function: "Specialty Chemical Production", supplies_id: "SUP-0093", latitude: 34.18124557831231, longitude: 87.463754210236 },
  { supplier_id: "SUP-0037", supplier_name: "Innov Tech 162", tier_level: 3, site_location_country: "Singapore", site_location_city: "Woodlands", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0122", latitude: 47.016668128506694, longitude: 97.17279859221357 },
  { supplier_id: "SUP-0038", supplier_name: "Innov Semi 161", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Specialty Chemical Production", supplies_id: "SUP-0069", latitude: 25.164318997952794, longitude: 92.37507053826674 },
  { supplier_id: "SUP-0039", supplier_name: "Precision Foundry 160", tier_level: 3, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Specialty Chemical Production", supplies_id: "SUP-0102", latitude: 35.657011454386634, longitude: 87.89388911479995 },
  { supplier_id: "SUP-0040", supplier_name: "Poly Semi 159", tier_level: 3, site_location_country: "China", site_location_city: "Suzhou", site_function: "Raw Material Extraction", supplies_id: "SUP-0077", latitude: 32.28265908989621, longitude: 96.97620272838371 },
  { supplier_id: "SUP-0041", supplier_name: "Global Systems 158", tier_level: 3, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0079", latitude: 39.338061898582225, longitude: 83.33126858295388 },
  { supplier_id: "SUP-0042", supplier_name: "Precision Fab 157", tier_level: 3, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Specialty Chemical Production", supplies_id: "SUP-0112", latitude: 28.555722033625507, longitude: 116.26795128955582 },
  { supplier_id: "SUP-0043", supplier_name: "Innov Semi 156", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Specialty Chemical Production", supplies_id: "SUP-0067", latitude: 46.21493776473345, longitude: 96.5963874791447 },
  { supplier_id: "SUP-0044", supplier_name: "Innov Systems 155", tier_level: 3, site_location_country: "South Korea", site_location_city: "Gumi", site_function: "Specialty Chemical Production", supplies_id: "SUP-0158", latitude: 30.534319618637703, longitude: 128.3632169815043 },
  { supplier_id: "SUP-0045", supplier_name: "Global Corp 154", tier_level: 3, site_location_country: "Japan", site_location_city: "Nagasaki", site_function: "Raw Material Extraction", supplies_id: "SUP-0157", latitude: 37.81315322203044, longitude: 126.8754458394993 },
  { supplier_id: "SUP-0046", supplier_name: "Core Logistics 153", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Raw Material Extraction", supplies_id: "SUP-0105", latitude: 43.783882015905256, longitude: 120.72503098531894 },
  { supplier_id: "SUP-0047", supplier_name: "Global Tech 152", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Specialty Chemical Production", supplies_id: "SUP-0128", latitude: 42.168518831831314, longitude: 114.29992697802551 },
  { supplier_id: "SUP-0048", supplier_name: "Core Fab 151", tier_level: 3, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Specialty Chemical Production", supplies_id: "SUP-0088", latitude: 32.67471052345952, longitude: 98.02745740191459 },
  { supplier_id: "SUP-0049", supplier_name: "Precision Semi 150", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Raw Material Extraction", supplies_id: "SUP-0109", latitude: 26.423034020441555, longitude: 127.32872198602412 },
  { supplier_id: "SUP-0050", supplier_name: "Syn Devices 149", tier_level: 3, site_location_country: "China", site_location_city: "Suzhou", site_function: "Specialty Chemical Production", supplies_id: "SUP-0152", latitude: 24.195846273049558, longitude: 83.7784823677774 },
  { supplier_id: "SUP-0051", supplier_name: "Poly Systems 148", tier_level: 3, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Raw Material Extraction", supplies_id: "SUP-0139", latitude: 43.20297804399154, longitude: 121.66354083019931 },
  { supplier_id: "SUP-0052", supplier_name: "Syn Systems 147", tier_level: 3, site_location_country: "Japan", site_location_city: "Mie", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0132", latitude: 30.02914096721435, longitude: 118.29072419652658 },
  { supplier_id: "SUP-0053", supplier_name: "Innov Fab 146", tier_level: 3, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0114", latitude: 32.8442195627462, longitude: 130.80180874392786 },
  { supplier_id: "SUP-0054", supplier_name: "Global Devices 145", tier_level: 3, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Raw Material Extraction", supplies_id: "SUP-0066", latitude: 24.948346694621065, longitude: 101.91894284135505 },
  { supplier_id: "SUP-0055", supplier_name: "Asia Logistics 144", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Raw Material Extraction", supplies_id: "SUP-0118", latitude: 27.082891629920425, longitude: 102.25964279388286 },
  { supplier_id: "SUP-0056", supplier_name: "Advanced Logistics 143", tier_level: 3, site_location_country: "China", site_location_city: "Guangzhou", site_function: "Specialty Chemical Production", supplies_id: "SUP-0156", latitude: 33.42973247031277, longitude: 106.76228225913121 },
  { supplier_id: "SUP-0057", supplier_name: "Auto Corp 142", tier_level: 3, site_location_country: "USA", site_location_city: "Texas", site_function: "Specialty Chemical Production", supplies_id: "SUP-0070", latitude: 30.243568191645007, longitude: -97.65057396595117 },
  { supplier_id: "SUP-0058", supplier_name: "Global Systems 141", tier_level: 3, site_location_country: "China", site_location_city: "Suzhou", site_function: "Rare Gas Sourcing", supplies_id: "SUP-0066", latitude: 49.48954815248808, longitude: 103.0603734088876 },
  { supplier_id: "SUP-0059", supplier_name: "Global Logistics 140", tier_level: 3, site_location_country: "Germany", site_location_city: "Munich", site_function: "Raw Material Extraction", supplies_id: "SUP-0143", latitude: 35.88717190176072, longitude: 128.37365950512768 },
  // Tier 2 suppliers
  { supplier_id: "SUP-0060", supplier_name: "Global Materials 139", tier_level: 2, site_location_country: "Taiwan", site_location_city: "Hsinchu", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0062", latitude: 24.82823580724089, longitude: 121.04482338901045 },
  { supplier_id: "SUP-0061", supplier_name: "Asia Chem 138", tier_level: 2, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "SiC/GaN Substrate Growth", supplies_id: "SUP-0190", latitude: 32.85917845534669, longitude: 130.81023320961697 },
  { supplier_id: "SUP-0062", supplier_name: "Innov Materials 137", tier_level: 2, site_location_country: "China", site_location_city: "Shanghai", site_function: "Molding Compound Production", supplies_id: "SUP-0176", latitude: 31.184558259918273, longitude: 121.55106124179565 },
  { supplier_id: "SUP-0063", supplier_name: "Core Chem 136", tier_level: 2, site_location_country: "Taiwan", site_location_city: "Hsinchu", site_function: "SiC/GaN Substrate Growth", supplies_id: "SUP-0063", latitude: 24.889282652602354, longitude: 120.9144076013814 },
  { supplier_id: "SUP-0064", supplier_name: "Asia Logistics 135", tier_level: 2, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "Molding Compound Production", supplies_id: "SUP-0148", latitude: 3.045334038160588, longitude: 101.60065137743422 },
  { supplier_id: "SUP-0065", supplier_name: "Poly Tech 134", tier_level: 2, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0179", latitude: 35.159118511044724, longitude: 91.76388622785518 },
  { supplier_id: "SUP-0066", supplier_name: "Innov Tech 133", tier_level: 2, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0182", latitude: 32.85783525752232, longitude: 130.76999213685883 },
  { supplier_id: "SUP-0067", supplier_name: "Advanced Tech 132", tier_level: 2, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Photoresist/Mask Production", supplies_id: "SUP-0160", latitude: 32.74737587946265, longitude: 130.80595231663057 },
  { supplier_id: "SUP-0068", supplier_name: "Advanced Semi 131", tier_level: 2, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Molding Compound Production", supplies_id: "SUP-0183", latitude: 40.923266892337324, longitude: 86.92935488570576 },
  { supplier_id: "SUP-0069", supplier_name: "Core Materials 130", tier_level: 2, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Molding Compound Production", supplies_id: "SUP-0171", latitude: 20.108720734855947, longitude: 84.02828118339254 },
  { supplier_id: "SUP-0070", supplier_name: "Auto Chem 129", tier_level: 2, site_location_country: "Vietnam", site_location_city: "Ho Chi Minh City", site_function: "Molding Compound Production", supplies_id: "SUP-0189", latitude: 36.46968166449241, longitude: 116.28397663831143 },
  { supplier_id: "SUP-0071", supplier_name: "Core Semi 128", tier_level: 2, site_location_country: "Japan", site_location_city: "Mie", site_function: "Photoresist/Mask Production", supplies_id: "SUP-0175", latitude: 28.552597230500687, longitude: 95.04152483806169 },
  { supplier_id: "SUP-0072", supplier_name: "Auto Semi 127", tier_level: 2, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "SiC/GaN Substrate Growth", supplies_id: "SUP-0189", latitude: 43.739144838241145, longitude: 102.93671020895484 },
  { supplier_id: "SUP-0073", supplier_name: "Auto Tech 126", tier_level: 2, site_location_country: "Japan", site_location_city: "Mie", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0191", latitude: 37.90524643061029, longitude: 80.77015523717893 },
  { supplier_id: "SUP-0074", supplier_name: "Asia Materials 125", tier_level: 2, site_location_country: "Taiwan", site_location_city: "Tainan", site_function: "Photoresist/Mask Production", supplies_id: "SUP-0176", latitude: 23.02296191655519, longitude: 120.16811284776131 },
  { supplier_id: "SUP-0075", supplier_name: "Advanced Devices 124", tier_level: 2, site_location_country: "Singapore", site_location_city: "Woodlands", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0193", latitude: 32.41415064725365, longitude: 113.31349598529088 },
  // Continue with more Tier 2 suppliers
  { supplier_id: "SUP-0088", supplier_name: "Poly Corp 111", tier_level: 2, site_location_country: "South Korea", site_location_city: "Cheonan", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0132", latitude: 36.78732895365214, longitude: 127.24474471686307 },
  { supplier_id: "SUP-0100", supplier_name: "Global Chem 99", tier_level: 2, site_location_country: "South Korea", site_location_city: "Yongin", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0187", latitude: 42.898426130264646, longitude: 108.67569572588526 },
  { supplier_id: "SUP-0112", supplier_name: "Innov Systems 87", tier_level: 2, site_location_country: "China", site_location_city: "Shanghai", site_function: "SiC/GaN Substrate Growth", supplies_id: "SUP-0167", latitude: 31.273773931978145, longitude: 121.47513913096606 },
  { supplier_id: "SUP-0128", supplier_name: "Advanced Materials 71", tier_level: 2, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Silicon Wafer Fabrication (300mm)", supplies_id: "SUP-0180", latitude: 32.811332052564126, longitude: 130.7025164998494 },
  { supplier_id: "SUP-0140", supplier_name: "Auto Logistics 59", tier_level: 2, site_location_country: "Japan", site_location_city: "Nagasaki", site_function: "SiC/GaN Substrate Growth", supplies_id: "SUP-0166", latitude: 31.956379690820246, longitude: 108.5247267793757 },
  // Tier 1 suppliers
  { supplier_id: "SUP-0160", supplier_name: "Syn Chem 39", tier_level: 1, site_location_country: "China", site_location_city: "Shanghai", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 31.200857397728964, longitude: 121.52439795682974 },
  { supplier_id: "SUP-0161", supplier_name: "Core Devices 38", tier_level: 1, site_location_country: "South Korea", site_location_city: "Yongin", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 41.66639950182474, longitude: 112.18747031598883 },
  { supplier_id: "SUP-0162", supplier_name: "Advanced Materials 37", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Penang", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 5.341617330161481, longitude: 100.22497340759857 },
  { supplier_id: "SUP-0163", supplier_name: "Precision Chem 36", tier_level: 1, site_location_country: "USA", site_location_city: "Oregon", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 49.145119655197774, longitude: 94.82218382281633 },
  { supplier_id: "SUP-0164", supplier_name: "Syn Corp 35", tier_level: 1, site_location_country: "China", site_location_city: "Shanghai", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 31.199760634840263, longitude: 121.55674007495416 },
  { supplier_id: "SUP-0165", supplier_name: "Poly Systems 34", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Penang", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 5.254374821146543, longitude: 100.3153244491565 },
  { supplier_id: "SUP-0166", supplier_name: "Precision Fab 33", tier_level: 1, site_location_country: "Vietnam", site_location_city: "Hanoi", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 21.093675492026115, longitude: 105.94092177267828 },
  { supplier_id: "SUP-0167", supplier_name: "Core Fab 32", tier_level: 1, site_location_country: "Taiwan", site_location_city: "Tainan", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 22.957526068322828, longitude: 120.26282825749968 },
  { supplier_id: "SUP-0168", supplier_name: "Auto Semi 31", tier_level: 1, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 32.7412887950947, longitude: 130.7358158526033 },
  { supplier_id: "SUP-0169", supplier_name: "Advanced Corp 30", tier_level: 1, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 26.148645002774558, longitude: 106.968130445562 },
  { supplier_id: "SUP-0170", supplier_name: "Syn Corp 29", tier_level: 1, site_location_country: "Taiwan", site_location_city: "Hsinchu", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 24.817366099714164, longitude: 120.91849160768206 },
  { supplier_id: "SUP-0171", supplier_name: "Asia Systems 28", tier_level: 1, site_location_country: "Singapore", site_location_city: "Woodlands", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 40.12260786147485, longitude: 106.46257270800784 },
  { supplier_id: "SUP-0172", supplier_name: "Advanced Corp 27", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 3.06010898095547, longitude: 101.74415321161965 },
  { supplier_id: "SUP-0173", supplier_name: "Poly Logistics 26", tier_level: 1, site_location_country: "China", site_location_city: "Suzhou", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 20.241263328247896, longitude: 107.4990097792902 },
  { supplier_id: "SUP-0174", supplier_name: "Syn Logistics 25", tier_level: 1, site_location_country: "USA", site_location_city: "Oregon", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 48.04645266197273, longitude: 123.85987227064493 },
  { supplier_id: "SUP-0175", supplier_name: "Global Chem 24", tier_level: 1, site_location_country: "Japan", site_location_city: "Nagasaki", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 48.94660075030613, longitude: 96.13997249770546 },
  { supplier_id: "SUP-0176", supplier_name: "Global Devices 23", tier_level: 1, site_location_country: "Taiwan", site_location_city: "New Taipei", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 22.690852070724212, longitude: 108.75129119441715 },
  { supplier_id: "SUP-0177", supplier_name: "Core Chem 22", tier_level: 1, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 48.03509434761497, longitude: 125.73793527812559 },
  { supplier_id: "SUP-0178", supplier_name: "Syn Tech 21", tier_level: 1, site_location_country: "Vietnam", site_location_city: "Ho Chi Minh City", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 25.37309558678358, longitude: 125.96113950740236 },
  { supplier_id: "SUP-0179", supplier_name: "Poly Logistics 20", tier_level: 1, site_location_country: "Germany", site_location_city: "Munich", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 34.9539431956694, longitude: 126.91564517846743 },
  { supplier_id: "SUP-0180", supplier_name: "Global Fab 19", tier_level: 1, site_location_country: "South Korea", site_location_city: "Cheonan", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 36.8235923737329, longitude: 127.07146013815472 },
  { supplier_id: "SUP-0181", supplier_name: "Global Devices 18", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 3.2378198940177447, longitude: 101.6986600967114 },
  { supplier_id: "SUP-0182", supplier_name: "Poly Corp 17", tier_level: 1, site_location_country: "Germany", site_location_city: "Munich", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 34.88758455797017, longitude: 126.92162924084487 },
  { supplier_id: "SUP-0183", supplier_name: "Precision Systems 16", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 3.0724988525079477, longitude: 101.68178289420646 },
  { supplier_id: "SUP-0184", supplier_name: "Poly Semi 15", tier_level: 1, site_location_country: "USA", site_location_city: "Arizona", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 33.497323579098456, longitude: -112.01184646711494 },
  { supplier_id: "SUP-0185", supplier_name: "Precision Devices 14", tier_level: 1, site_location_country: "Vietnam", site_location_city: "Hanoi", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 20.965098982767692, longitude: 105.92122930085469 },
  { supplier_id: "SUP-0186", supplier_name: "Syn Tech 13", tier_level: 1, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 46.91433898531121, longitude: 121.26683881778516 },
  { supplier_id: "SUP-0187", supplier_name: "Core Logistics 12", tier_level: 1, site_location_country: "Japan", site_location_city: "Mie", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 40.00579797742549, longitude: 89.20378038638401 },
  { supplier_id: "SUP-0188", supplier_name: "Auto Systems 11", tier_level: 1, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 27.38851676057466, longitude: 93.09001518362848 },
  { supplier_id: "SUP-0189", supplier_name: "Advanced Chem 10", tier_level: 1, site_location_country: "Singapore", site_location_city: "Woodlands", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 48.66562118532757, longitude: 94.99957913141957 },
  { supplier_id: "SUP-0190", supplier_name: "Asia Chem 9", tier_level: 1, site_location_country: "Germany", site_location_city: "Munich", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 39.52292587846606, longitude: 114.56207449069774 },
  { supplier_id: "SUP-0191", supplier_name: "Innov Logistics 8", tier_level: 1, site_location_country: "Taiwan", site_location_city: "Hsinchu", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 24.800504094247678, longitude: 121.04902367396325 },
  { supplier_id: "SUP-0192", supplier_name: "Advanced Systems 7", tier_level: 1, site_location_country: "Singapore", site_location_city: "Woodlands", site_function: "IC Assembly & Test (OSAT)", supplies_id: "DIODES_CORP", latitude: 41.030194202236636, longitude: 95.63212349640314 },
  { supplier_id: "SUP-0193", supplier_name: "Asia Corp 6", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Kuala Lumpur", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 3.083825720187069, longitude: 101.61671375643935 },
  { supplier_id: "SUP-0194", supplier_name: "Auto Tech 5", tier_level: 1, site_location_country: "Taiwan", site_location_city: "Taichung", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 24.61671473029319, longitude: 117.36991098062907 },
  { supplier_id: "SUP-0195", supplier_name: "Global Logistics 4", tier_level: 1, site_location_country: "Germany", site_location_city: "Munich", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 36.48453880208958, longitude: 103.57422273183352 },
  { supplier_id: "SUP-0196", supplier_name: "Global Chem 3", tier_level: 1, site_location_country: "Taiwan", site_location_city: "Taichung", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 26.60329658966475, longitude: 92.44789847712643 },
  { supplier_id: "SUP-0197", supplier_name: "Advanced Materials 2", tier_level: 1, site_location_country: "Japan", site_location_city: "Kumamoto", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 32.830753225031174, longitude: 130.6556205444295 },
  { supplier_id: "SUP-0198", supplier_name: "Syn Systems 1", tier_level: 1, site_location_country: "Malaysia", site_location_city: "Penang", site_function: "Backend Final Test/Packaging", supplies_id: "DIODES_CORP", latitude: 5.339529849742187, longitude: 100.28109741121852 },
  { supplier_id: "SUP-0199", supplier_name: "Global Tech 0", tier_level: 1, site_location_country: "Singapore", site_location_city: "Tuas", site_function: "Advanced Wafer Fabrication (Logic/Power)", supplies_id: "DIODES_CORP", latitude: 37.14667375438438, longitude: 87.49668737735767 }
]

const RISK_DATA = [
  { supplier_id: "SUP-0000", site_location_country: "Malaysia", geopolitical_risk_index: 0.467, natural_disaster_risk_index: 0.443, water_scarcity_index: 0.26, overall_risk_score: 0.461, esg_audit_score: 84, alternative_source_count: 3 },
  { supplier_id: "SUP-0001", site_location_country: "Malaysia", geopolitical_risk_index: 0.525, natural_disaster_risk_index: 0.443, water_scarcity_index: 0.24, overall_risk_score: 0.486, esg_audit_score: 83, alternative_source_count: 3 },
  { supplier_id: "SUP-0002", site_location_country: "Japan", geopolitical_risk_index: 0.518, natural_disaster_risk_index: 0.865, water_scarcity_index: 0.245, overall_risk_score: 0.616, esg_audit_score: 86, alternative_source_count: 0 },
  { supplier_id: "SUP-0003", site_location_country: "Vietnam", geopolitical_risk_index: 0.631, natural_disaster_risk_index: 0.538, water_scarcity_index: 0.373, overall_risk_score: 0.699, esg_audit_score: 67, alternative_source_count: 2 },
  { supplier_id: "SUP-0004", site_location_country: "Japan", geopolitical_risk_index: 0.541, natural_disaster_risk_index: 0.931, water_scarcity_index: 0.159, overall_risk_score: 0.641, esg_audit_score: 82, alternative_source_count: 0 },
  { supplier_id: "SUP-0005", site_location_country: "USA", geopolitical_risk_index: 0.271, natural_disaster_risk_index: 0.338, water_scarcity_index: 0.325, overall_risk_score: 0.369, esg_audit_score: 80, alternative_source_count: 3 },
  { supplier_id: "SUP-0008", site_location_country: "China", geopolitical_risk_index: 0.767, natural_disaster_risk_index: 0.502, water_scarcity_index: 0.557, overall_risk_score: 0.825, esg_audit_score: 68, alternative_source_count: 2 },
  { supplier_id: "SUP-0010", site_location_country: "Singapore", geopolitical_risk_index: 0.315, natural_disaster_risk_index: 0.276, water_scarcity_index: 0.792, overall_risk_score: 0.527, esg_audit_score: 82, alternative_source_count: 1 },
  { supplier_id: "SUP-0012", site_location_country: "Taiwan", geopolitical_risk_index: 1.0, natural_disaster_risk_index: 0.874, water_scarcity_index: 0.713, overall_risk_score: 1.016, esg_audit_score: 84, alternative_source_count: 1 },
  { supplier_id: "SUP-0014", site_location_country: "China", geopolitical_risk_index: 0.85, natural_disaster_risk_index: 0.471, water_scarcity_index: 0.642, overall_risk_score: 0.917, esg_audit_score: 64, alternative_source_count: 0 },
  { supplier_id: "SUP-0016", site_location_country: "South Korea", geopolitical_risk_index: 0.632, natural_disaster_risk_index: 0.637, water_scarcity_index: 0.432, overall_risk_score: 0.631, esg_audit_score: 90, alternative_source_count: 1 },
  { supplier_id: "SUP-0034", site_location_country: "Germany", geopolitical_risk_index: 0.287, natural_disaster_risk_index: 0.11, water_scarcity_index: 0.067, overall_risk_score: 0.198, esg_audit_score: 82, alternative_source_count: 3 },
  { supplier_id: "SUP-0060", site_location_country: "Taiwan", geopolitical_risk_index: 0.985, natural_disaster_risk_index: 0.822, water_scarcity_index: 0.732, overall_risk_score: 0.998, esg_audit_score: 84, alternative_source_count: 0 },
  { supplier_id: "SUP-0160", site_location_country: "China", geopolitical_risk_index: 0.824, natural_disaster_risk_index: 0.511, water_scarcity_index: 0.56, overall_risk_score: 0.833, esg_audit_score: 72, alternative_source_count: 1 },
  { supplier_id: "SUP-0164", site_location_country: "China", geopolitical_risk_index: 0.894, natural_disaster_risk_index: 0.567, water_scarcity_index: 0.68, overall_risk_score: 0.973, esg_audit_score: 67, alternative_source_count: 2 },
  { supplier_id: "SUP-0167", site_location_country: "Taiwan", geopolitical_risk_index: 0.949, natural_disaster_risk_index: 0.909, water_scarcity_index: 0.826, overall_risk_score: 1.107, esg_audit_score: 77, alternative_source_count: 3 },
  { supplier_id: "SUP-0168", site_location_country: "Japan", geopolitical_risk_index: 0.497, natural_disaster_risk_index: 0.948, water_scarcity_index: 0.151, overall_risk_score: 0.597, esg_audit_score: 87, alternative_source_count: 1 },
  { supplier_id: "SUP-0170", site_location_country: "Taiwan", geopolitical_risk_index: 0.979, natural_disaster_risk_index: 0.832, water_scarcity_index: 0.73, overall_risk_score: 0.989, esg_audit_score: 85, alternative_source_count: 1 },
  { supplier_id: "SUP-0179", site_location_country: "Germany", geopolitical_risk_index: 0.199, natural_disaster_risk_index: 0.207, water_scarcity_index: 0.186, overall_risk_score: 0.223, esg_audit_score: 87, alternative_source_count: 0 },
  { supplier_id: "SUP-0180", site_location_country: "South Korea", geopolitical_risk_index: 0.766, natural_disaster_risk_index: 0.61, water_scarcity_index: 0.504, overall_risk_score: 0.794, esg_audit_score: 76, alternative_source_count: 3 },
  { supplier_id: "SUP-0183", site_location_country: "Malaysia", geopolitical_risk_index: 0.579, natural_disaster_risk_index: 0.338, water_scarcity_index: 0.407, overall_risk_score: 0.569, esg_audit_score: 75, alternative_source_count: 3 },
  { supplier_id: "SUP-0184", site_location_country: "USA", geopolitical_risk_index: 0.332, natural_disaster_risk_index: 0.217, water_scarcity_index: 0.297, overall_risk_score: 0.35, esg_audit_score: 78, alternative_source_count: 1 },
  { supplier_id: "SUP-0185", site_location_country: "Vietnam", geopolitical_risk_index: 0.614, natural_disaster_risk_index: 0.497, water_scarcity_index: 0.388, overall_risk_score: 0.69, esg_audit_score: 65, alternative_source_count: 3 },
  { supplier_id: "SUP-0190", site_location_country: "Germany", geopolitical_risk_index: 0.187, natural_disaster_risk_index: 0.017, water_scarcity_index: 0.12, overall_risk_score: 0.13, esg_audit_score: 88, alternative_source_count: 3 },
  { supplier_id: "SUP-0191", site_location_country: "Taiwan", geopolitical_risk_index: 1.0, natural_disaster_risk_index: 0.882, water_scarcity_index: 0.692, overall_risk_score: 1.047, esg_audit_score: 80, alternative_source_count: 2 },
  { supplier_id: "SUP-0197", site_location_country: "Japan", geopolitical_risk_index: 0.465, natural_disaster_risk_index: 0.911, water_scarcity_index: 0.194, overall_risk_score: 0.606, esg_audit_score: 83, alternative_source_count: 1 }
]

const PRODUCT_COMPONENTS = [
  { diodes_sku: "DIO-AUTO-PM000", component_name: "High-Side Power Switch IC", supplier_id: "SUP-0197", annual_volume_units: 37197, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM000", component_name: "Epoxy Molding Compound", supplier_id: "SUP-0123", annual_volume_units: 22382, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM000", component_name: "SiC Power MOSFET Die", supplier_id: "SUP-0168", annual_volume_units: 41973, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM001", component_name: "Epoxy Molding Compound", supplier_id: "SUP-0095", annual_volume_units: 84546, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM002", component_name: "Specialty Etching Gas", supplier_id: "SUP-0059", annual_volume_units: 88433, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM003", component_name: "SiC Power MOSFET Die", supplier_id: "SUP-0167", annual_volume_units: 38587, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM005", component_name: "Advanced BGA Package Substrate", supplier_id: "SUP-0112", annual_volume_units: 32145, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM006", component_name: "GaN HEMT Transistor Die", supplier_id: "SUP-0173", annual_volume_units: 26387, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM008", component_name: "Epoxy Molding Compound", supplier_id: "SUP-0005", annual_volume_units: 110023, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM010", component_name: "SiC Power MOSFET Die", supplier_id: "SUP-0174", annual_volume_units: 8639, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM012", component_name: "SiC Power MOSFET Die", supplier_id: "SUP-0183", annual_volume_units: 32399, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM015", component_name: "High-Side Power Switch IC", supplier_id: "SUP-0145", annual_volume_units: 73985, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM016", component_name: "SiC Power MOSFET Die", supplier_id: "SUP-0193", annual_volume_units: 85567, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM017", component_name: "Low Dropout Regulator (LDO)", supplier_id: "SUP-0154", annual_volume_units: 87408, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PM020", component_name: "GaN HEMT Transistor Die", supplier_id: "SUP-0191", annual_volume_units: 27018, criticality_flag: "High" },
  { diodes_sku: "DIO-AUTO-PROT003", component_name: "Advanced BGA Package Substrate", supplier_id: "SUP-0088", annual_volume_units: 57682, criticality_flag: "Medium" },
  { diodes_sku: "DIO-AUTO-PROT008", component_name: "GaN HEMT Transistor Die", supplier_id: "SUP-0101", annual_volume_units: 13193, criticality_flag: "Medium" },
  { diodes_sku: "DIO-AUTO-PROT013", component_name: "Epoxy Molding Compound", supplier_id: "SUP-0077", annual_volume_units: 88121, criticality_flag: "Medium" },
  { diodes_sku: "DIO-AUTO-PROT020", component_name: "Epoxy Molding Compound", supplier_id: "SUP-0080", annual_volume_units: 218060, criticality_flag: "Medium" },
  { diodes_sku: "DIO-AUTO-PROT021", component_name: "High-Side Power Switch IC", supplier_id: "SUP-0187", annual_volume_units: 63708, criticality_flag: "Medium" }
]

export function getMockSuppliers() {
  return { success: true, data: SUPPLIERS, mock: true }
}

export function getMockSupplierById(id) {
  const supplier = SUPPLIERS.find(s => s.supplier_id === id)
  const risk = RISK_DATA.find(r => r.supplier_id === id)
  return { success: true, data: { ...supplier, ...risk }, mock: true }
}

export function getMockRiskData() {
  return { success: true, data: RISK_DATA, mock: true }
}

export function getMockProductComponents() {
  return { success: true, data: PRODUCT_COMPONENTS, mock: true }
}

export function getMockConcentrationAnalysis() {
  const countryStats = {}
  SUPPLIERS.forEach(s => {
    if (!countryStats[s.site_location_country]) {
      countryStats[s.site_location_country] = { count: 0, tier1: 0, tier2: 0, tier3: 0, suppliers: [] }
    }
    countryStats[s.site_location_country].count++
    countryStats[s.site_location_country][`tier${s.tier_level}`]++
    countryStats[s.site_location_country].suppliers.push(s.supplier_id)
  })

  const analysis = Object.entries(countryStats).map(([country, stats]) => {
    const risks = RISK_DATA.filter(r => r.site_location_country === country)
    const avgRisk = risks.length > 0 
      ? risks.reduce((sum, r) => sum + r.overall_risk_score, 0) / risks.length 
      : 0
    return {
      country,
      supplierCount: stats.count,
      tier1Count: stats.tier1,
      tier2Count: stats.tier2,
      tier3Count: stats.tier3,
      avgRiskScore: avgRisk,
      concentrationLevel: stats.count > 20 ? 'Critical' : stats.count > 10 ? 'High' : stats.count > 5 ? 'Medium' : 'Low'
    }
  }).sort((a, b) => b.supplierCount - a.supplierCount)

  return { success: true, data: analysis, mock: true }
}

export function getMockRecommendations() {
  return {
    success: true,
    data: [
      {
        id: 1,
        priority: 'Critical',
        category: 'Geographic Diversification',
        title: 'Reduce Taiwan Concentration',
        description: 'Taiwan represents highest concentration with critical geopolitical risk (1.0 index). Consider diversifying Tier 1 wafer fabrication to Japan, South Korea, or USA facilities.',
        impactedSuppliers: 28,
        estimatedTimeframe: '12-18 months',
        riskReduction: 0.35
      },
      {
        id: 2,
        priority: 'High',
        category: 'Geographic Diversification',
        title: 'Reduce China Dependency',
        description: 'China suppliers show high geopolitical risk (0.8+ index) with limited alternatives. Develop secondary sources in Vietnam, Malaysia, or India.',
        impactedSuppliers: 22,
        estimatedTimeframe: '6-12 months',
        riskReduction: 0.25
      },
      {
        id: 3,
        priority: 'High',
        category: 'Single Source Risk',
        title: 'SiC Power MOSFET Die Diversification',
        description: 'Critical component sourced from limited suppliers in high-risk regions. Qualify additional suppliers in Germany or USA.',
        impactedSuppliers: 8,
        estimatedTimeframe: '9-12 months',
        riskReduction: 0.20
      },
      {
        id: 4,
        priority: 'Medium',
        category: 'ESG Compliance',
        title: 'Improve Vietnam Supplier ESG',
        description: 'Vietnam suppliers average ESG score of 67 is below target. Implement supplier development programs.',
        impactedSuppliers: 12,
        estimatedTimeframe: '6-9 months',
        riskReduction: 0.10
      },
      {
        id: 5,
        priority: 'Medium',
        category: 'Natural Disaster Risk',
        title: 'Japan Earthquake Contingency',
        description: 'High natural disaster risk (0.9+ index) in Japan. Establish backup inventory and alternative sourcing plans.',
        impactedSuppliers: 15,
        estimatedTimeframe: '3-6 months',
        riskReduction: 0.15
      },
      {
        id: 6,
        priority: 'Low',
        category: 'Water Scarcity',
        title: 'Singapore Water Risk Mitigation',
        description: 'Singapore facilities face water scarcity concerns. Evaluate water recycling investments and backup water sources.',
        impactedSuppliers: 18,
        estimatedTimeframe: '12+ months',
        riskReduction: 0.08
      }
    ],
    mock: true
  }
}
