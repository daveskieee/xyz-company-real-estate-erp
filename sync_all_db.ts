import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({ connectionString, ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {}) });

async function syncAllTables() {
  console.log('Connecting to PostgreSQL database...');

  // 1. Ensure labor_allocations and ai_manpower_recommendations tables exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS labor_allocations (
      id TEXT PRIMARY KEY,
      contractor_id TEXT NOT NULL,
      contractor_name TEXT NOT NULL,
      sector_name TEXT NOT NULL,
      target_lots TEXT NOT NULL,
      assigned_headcount INTEGER DEFAULT 0,
      work_scope TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      notes TEXT,
      updated_at DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_manpower_recommendations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_lots TEXT NOT NULL,
      contractor_id TEXT NOT NULL,
      contractor_name TEXT NOT NULL,
      current_headcount INTEGER NOT NULL,
      recommended_headcount INTEGER NOT NULL,
      rationale TEXT NOT NULL,
      priority TEXT DEFAULT 'MEDIUM',
      applied BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Ensure contractors table has commercial fit-out trade partners
  const contractorsCount = await pool.query('SELECT count(*) FROM contractors');
  if (parseInt(contractorsCount.rows[0].count, 10) === 0) {
    console.log('Seeding contractors table...');
    await pool.query(`
      INSERT INTO contractors (id, name, contact, "activeProjectSite", company, specialty, "contractAmount", "paidAmount", "activeManpower", "milestoneProgress", rating, "createdAt", "updatedAt") VALUES
      ('CONT-001', 'Mauro Principe Jr.', '0917-555-0192', 'NexBridge Software Hub', 'SolidFoundations Engineering', 'Architectural Carpentry & Joinery', 4500000, 3200000, 14, 82.5, 4.9, NOW(), NOW()),
      ('CONT-002', 'Danilo Santos', '0918-888-2341', 'NexBridge Software Hub', 'ElectroTech Systems', 'Commercial Electrical & Structured Cabling', 3800000, 2500000, 12, 75.0, 4.8, NOW(), NOW()),
      ('CONT-003', 'Arnel Bautista', '0920-333-7890', 'BGComm Global BPO Floor', 'HVAC AirFlow Dynamics', 'High-Density Precision Chilled HVAC', 5200000, 3100000, 10, 60.0, 4.7, NOW(), NOW()),
      ('CONT-004', 'Eduardo Magsaysay', '0919-444-5678', 'RedBin Commercial HQ', 'AcousticWall Drywallers', 'Soundproof Acoustic Partitions & Ceilings', 2900000, 2100000, 8, 92.0, 4.9, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 3. Ensure land_parcels table has records matching the commercial project sites
  const parcelsCount = await pool.query('SELECT count(*) FROM land_parcels');
  if (parseInt(parcelsCount.rows[0].count, 10) === 0) {
    console.log('Seeding land_parcels table with commercial project sites...');
    await pool.query(`
      INSERT INTO land_parcels (id, name, location, "purchaseCost", "totalAreaSqm", "totalSlots", "acquisitionDate", "createdAt", "updatedAt") VALUES
      ('PRJ-NEX', 'NexBridge Software Hub Site', 'Tower 3, 4th Floor, Cabuyao Technopark, Laguna', 9750000, 500, 1, '2026-01-10', NOW(), NOW()),
      ('PRJ-BGC', 'BGComm Global BPO Site', 'Floor 7, Gateway Central, BGC / Laguna Expansion Zone', 18500000, 1200, 1, '2026-02-01', NOW(), NOW()),
      ('PRJ-RED', 'RedBin Commercial HQ Site', 'Sector 4, Greenfield Hub, Sta. Rosa - Cabuyao Gateway', 6200000, 380, 1, '2025-11-15', NOW(), NOW()),
      ('PRJ-OWL', 'Owl Creative Studio Site', 'Unit 12B, Creative Arts Hub, Cabuyao, Laguna', 3900000, 240, 1, '2026-03-01', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 4. Ensure civil_works_milestones table has fit-out phases for each project
  const milestonesCount = await pool.query('SELECT count(*) FROM civil_works_milestones');
  if (parseInt(milestonesCount.rows[0].count, 10) === 0) {
    console.log('Seeding civil_works_milestones table...');
    await pool.query(`
      INSERT INTO civil_works_milestones (id, "parcelId", "phaseName", "targetPercentage", "currentPercentage", status, "inspectorSignOff", "signOffDate", remarks, "createdAt", "updatedAt") VALUES
      ('MLS-NEX-01', 'PRJ-NEX', 'Demolition & Core MEPFS Roughing', 100, 100, 'COMPLETED', true, '2026-02-15', 'Full core demolition signed off with zero structural infractions.', NOW(), NOW()),
      ('MLS-NEX-02', 'PRJ-NEX', 'Acoustic Drywall Framing & Cabling', 100, 85, 'IN_PROGRESS', false, NULL, 'Acoustic glass perimeter frames mounted; pulling Category 6A cables.', NOW(), NOW()),
      ('MLS-NEX-03', 'PRJ-NEX', 'MEPFS Testing & Balancing', 100, 60, 'IN_PROGRESS', false, NULL, 'Chilled water lines pressurized at 150 PSI.', NOW(), NOW()),
      ('MLS-NEX-04', 'PRJ-NEX', 'Architectural Finishes & Joinery', 100, 40, 'IN_PROGRESS', false, NULL, 'Executive boardroom veneer panels undergoing final polish.', NOW(), NOW()),
      ('MLS-NEX-05', 'PRJ-NEX', 'Turnkey Handover & Final QA Sign-off', 100, 0, 'NOT_STARTED', false, NULL, 'Joint OBO & BFP inspection slated for October 2026.', NOW(), NOW()),

      ('MLS-BGC-01', 'PRJ-BGC', 'Core Floor Prep & Slab Leveling', 100, 100, 'COMPLETED', true, '2026-02-28', 'Self-leveling underlayment laid for 1,200 sqm call floor.', NOW(), NOW()),
      ('MLS-BGC-02', 'PRJ-BGC', 'High-Density HVAC Chiller & Heavy MEPFS', 100, 65, 'IN_PROGRESS', false, NULL, '250 kVA transformer integration underway.', NOW(), NOW()),
      ('MLS-BGC-03', 'PRJ-BGC', 'Acoustic Baffle Ceilings & Workstations', 100, 45, 'IN_PROGRESS', false, NULL, '350 workstation frames delivered and being assembled.', NOW(), NOW()),
      ('MLS-BGC-04', 'PRJ-BGC', 'Server Room Dual-Redundant Commissioning', 100, 20, 'IN_PROGRESS', false, NULL, 'Precision air conditioning modules installed in data center.', NOW(), NOW()),

      ('MLS-RED-01', 'PRJ-RED', 'Demolition & Spatial Partitioning', 100, 100, 'COMPLETED', true, '2025-12-20', 'Open layout established cleanly.', NOW(), NOW()),
      ('MLS-RED-02', 'PRJ-RED', 'Executive Millwork & Acoustic Ceilings', 100, 95, 'IN_PROGRESS', false, NULL, 'Walnut acoustic ceiling slats 95% complete.', NOW(), NOW()),
      ('MLS-RED-03', 'PRJ-RED', 'Telepresence & Biometric Security Setup', 100, 90, 'IN_PROGRESS', false, NULL, 'Crestron AV controllers configured.', NOW(), NOW()),
      ('MLS-RED-04', 'PRJ-RED', 'Executive Handover QA & Punch-List', 100, 80, 'IN_PROGRESS', false, NULL, 'Final touch-ups on paint and casework.', NOW(), NOW()),

      ('MLS-OWL-01', 'PRJ-OWL', 'Acoustic Decibel Isolation Shell', 100, 60, 'IN_PROGRESS', false, NULL, 'Floating floor and resilient channel drywalls installed.', NOW(), NOW()),
      ('MLS-OWL-02', 'PRJ-OWL', 'Cyclorama Green Screen & Casework', 100, 35, 'IN_PROGRESS', false, NULL, 'Infinity curve wall framework built.', NOW(), NOW()),
      ('MLS-OWL-03', 'PRJ-OWL', 'Studio Lighting & Power Distribution', 100, 25, 'IN_PROGRESS', false, NULL, 'DMX lighting grid brackets secured.', NOW(), NOW()),
      ('MLS-OWL-04', 'PRJ-OWL', 'Acoustic Certification & Handover', 100, 0, 'NOT_STARTED', false, NULL, 'Decibel leakage test to be verified with sound meter.', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 5. Ensure project_tasks table has commercial fit-out WBS tasks
  const tasksCount = await pool.query('SELECT count(*) FROM project_tasks');
  if (parseInt(tasksCount.rows[0].count, 10) === 0) {
    console.log('Seeding project_tasks table...');
    await pool.query(`
      INSERT INTO project_tasks (id, title, description, "assigneeName", "assigneeRole", priority, status, "dueDate", "startDate", "estimatedHours", "actualHours", category, "milestonePhase", "subtasksJson", tags, "createdAt", "updatedAt") VALUES
      ('TSK-001', 'Architectural Demolition & Core MEPFS Roughing', 'Complete demolition of legacy partition walls, roughing in chilled water pipes and electrical conduits.', 'Mauro Principe Jr.', 'Master Carpenter & Lead Foreman', 'HIGH', 'COMPLETED', '2026-02-15', '2026-01-15', 120, 118, 'CIVIL_WORKS', 'NexBridge Software Hub', '[{"id":"st-1","title":"Wall demolition","completed":true},{"id":"st-2","title":"Core drilling","completed":true}]', 'demolition,mepfs,roughing', NOW(), NOW()),
      ('TSK-002', 'Acoustic Drywall Framing & Structured Cabling', 'Installation of double-layer acoustic gypsum board, sound batts, and high-speed Cat6A cabling.', 'Danilo Santos', 'Certified Master Electrician', 'HIGH', 'IN_PROGRESS', '2026-03-30', '2026-02-16', 160, 136, 'ARCHITECTURAL', 'NexBridge Software Hub', '[{"id":"st-3","title":"Stud framing","completed":true},{"id":"st-4","title":"Cable pull","completed":true},{"id":"st-5","title":"Drywall taping","completed":false}]', 'drywall,cabling,framing', NOW(), NOW()),
      ('TSK-003', 'High-Density HVAC Server Chiller Setup', 'Mounting and ducting redundant 30-ton precision chillers for high-density BPO floor.', 'Arnel Bautista', 'HVAC Duct & Chiller Technician', 'CRITICAL', 'IN_PROGRESS', '2026-04-15', '2026-02-20', 200, 120, 'MEPFS', 'BGComm Global BPO Floor', '[{"id":"st-6","title":"Duct mounting","completed":true},{"id":"st-7","title":"Refrigerant test","completed":false}]', 'hvac,chillers,server-room', NOW(), NOW()),
      ('TSK-004', 'Drop Ceiling Slats & Architectural Casework', 'Crafted acoustic walnut ceiling grid and bespoke reception desk millwork.', 'Ramon Dela Cruz', 'Architectural Millwork Artisan', 'MEDIUM', 'IN_PROGRESS', '2026-04-05', '2026-03-01', 140, 132, 'FINISHES', 'RedBin Commercial HQ', '[{"id":"st-8","title":"Ceiling grid","completed":true},{"id":"st-9","title":"Veneer application","completed":true}]', 'ceiling,millwork,woodwork', NOW(), NOW()),
      ('TSK-005', 'Sound Studio Acoustic Decibel Isolation', 'Decoupled room-in-a-room construction with triple-layer acoustic seals and rockwool isolation.', 'Eduardo Magsaysay', 'Acoustic Partition Specialist', 'HIGH', 'IN_PROGRESS', '2026-05-10', '2026-03-10', 160, 64, 'ARCHITECTURAL', 'Owl Creative Studio', '[{"id":"st-10","title":"Floating floor","completed":true},{"id":"st-11","title":"Resilient channels","completed":false}]', 'studio,acoustic,soundproof', NOW(), NOW()),
      ('TSK-006', 'BFP Wet Pipe Sprinkler Flow & Hydrostatic Pressure Test', '2-hour 150 PSI hydrostatic hold test on all wet pipe overhead fire sprinkler lines.', 'Danilo Santos', 'Lead MEPFS Engineer', 'CRITICAL', 'TODO', '2026-04-20', '2026-04-10', 40, 0, 'MEPFS', 'NexBridge Software Hub', '[{"id":"st-12","title":"Gauge setup","completed":false},{"id":"st-13","title":"Fire marshal witness","completed":false}]', 'bfp,fire-safety,sprinklers', NOW(), NOW()),
      ('TSK-007', 'Executive Punch-List & Handover Quality Sign-Off', 'Detailed room-by-room architectural inspection and defect rectification prior to client key handover.', 'Engr. Ricardo Gomez', 'CTVill Quality Assurance Lead', 'HIGH', 'TODO', '2026-05-30', '2026-05-15', 80, 0, 'QA_HANDOVER', 'RedBin Commercial HQ', '[{"id":"st-14","title":"Punchlist audit","completed":false},{"id":"st-15","title":"Handover packet","completed":false}]', 'qa,punchlist,turnover', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 6. Ensure daily_site_logs table has field diary entries
  const siteLogsCount = await pool.query('SELECT count(*) FROM daily_site_logs');
  if (parseInt(siteLogsCount.rows[0].count, 10) === 0) {
    console.log('Seeding daily_site_logs table...');
    await pool.query(`
      INSERT INTO daily_site_logs (id, date, weather, temperature, "activeHeadcount", "equipmentOnSite", "toolboxTopic", "workCompleted", "delaysOrIssues", "supervisorName", "createdAt", "updatedAt") VALUES
      ('LOG-001', '2026-09-04', 'SUNNY', '31°C', 44, 'Scissor lift x2, Heavy core drill x2, Paint sprayer x3', 'Working at Heights & Fall Arrest Harness Inspection', 'NexBridge: Acoustic ceiling framing completed on quadrant C. BGComm: Server room cable ladder installation.', 'Minor 30-min material delivery bottleneck at freight elevator solved.', 'Engr. Ricardo Gomez', NOW(), NOW()),
      ('LOG-002', '2026-09-03', 'OVERCAST', '29°C', 42, 'Scissor lift x2, Chiller testing manifold, Vacuum sander', 'Electrical Lockout/Tagout (LOTO) Compliance Protocols', 'RedBin: High-gloss lacquer applied to executive boardroom conference casework. NexBridge: Cat6A terminations 80% done.', 'Zero safety incidents. All sub-contractors wore mandated PPE.', 'Mauro Principe Jr.', NOW(), NOW()),
      ('LOG-003', '2026-09-02', 'RAINY', '27°C', 38, 'Interior scissor lift, Floor scrubber, Dehumidifier x4', 'Indoor Wet Weather Air Quality & Dust Suppression', 'Owl Studio: Completed acoustic rockwool insulation installation across control room walls.', 'Exterior glass delivery delayed due to rain; interior works prioritized.', 'Danilo Santos', NOW(), NOW()),
      ('LOG-004', '2026-09-01', 'SUNNY', '32°C', 46, 'Scissor lift x3, Chiller recovery rig, Pipe threader', 'Ergonomics in Heavy Casework Lifting & Team Coordination', 'BGComm: 150 workstation desks assembled and aligned with in-floor power boxes.', 'No delays encountered.', 'Arnel Bautista', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 7. Ensure commercial client accounts exist in users, client_packages, installment_ledgers, and buyer_kyc
  const clientUsersCount = await pool.query("SELECT count(*) FROM users WHERE role = 'CLIENT'");
  if (parseInt(clientUsersCount.rows[0].count, 10) === 0) {
    console.log('Seeding commercial clients and installment ledgers...');
    
    // Insert 4 commercial client users
    await pool.query(`
      INSERT INTO users (id, email, name, role, "accountStatus", contact, "createdAt", "updatedAt") VALUES
      ('USR-CL-001', 'nexbridge@client.com', 'NexBridge Corp (Silicon Valley PH)', 'CLIENT', 'ACTIVE', '+63 917 111 2233', NOW(), NOW()),
      ('USR-CL-002', 'bgcomm@client.com', 'BG Communications Ltd.', 'CLIENT', 'ACTIVE', '+63 918 222 3344', NOW(), NOW()),
      ('USR-CL-003', 'redbin@client.com', 'RedBin Global Logistics', 'CLIENT', 'ACTIVE', '+63 920 333 4455', NOW(), NOW()),
      ('USR-CL-004', 'owl@client.com', 'Owl Creative Media Co.', 'CLIENT', 'ACTIVE', '+63 919 444 5566', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert buyer KYC records
    await pool.query(`
      INSERT INTO buyer_kyc (id, "userId", "govtIdVerified", "tinVerified", "proofOfIncomeVerified", "proofOfAddressVerified", "maritalConsentVerified", "kycStatus", "verifiedAt", notes, "createdAt", "updatedAt") VALUES
      ('KYC-001', 'USR-CL-001', true, true, true, true, true, 'VERIFIED', NOW(), 'SEC Articles of Incorporation, Corporate Board Resolution & Mayor Permit verified.', NOW(), NOW()),
      ('KYC-002', 'USR-CL-002', true, true, true, true, true, 'VERIFIED', NOW(), 'PEZA Registration Certificate and Tax Exemption documentation on file.', NOW(), NOW()),
      ('KYC-003', 'USR-CL-003', true, true, true, true, true, 'VERIFIED', NOW(), 'BIR 2303 Certificate & Corporate SEC registration verified.', NOW(), NOW()),
      ('KYC-004', 'USR-CL-004', true, true, true, true, true, 'VERIFIED', NOW(), 'DTI Business Registration and Audited Financial Statements verified.', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert client packages
    await pool.query(`
      INSERT INTO client_packages (id, "userId", price, "packageType", "paymentMethod", "createdAt", "updatedAt") VALUES
      ('PKG-001', 'USR-CL-001', 9750000, 'NexBridge Software Hub (Turnkey Tech Workspace)', 'INSTALLMENT', NOW(), NOW()),
      ('PKG-002', 'USR-CL-002', 18500000, 'BGComm Global BPO Floor (1,200 sqm High-Density)', 'INSTALLMENT', NOW(), NOW()),
      ('PKG-003', 'USR-CL-003', 6200000, 'RedBin Commercial HQ (Executive Corporate HQ)', 'INSTALLMENT', NOW(), NOW()),
      ('PKG-004', 'USR-CL-004', 3900000, 'Owl Creative Studio (Bespoke Media Production Studio)', 'INSTALLMENT', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert installment ledgers
    await pool.query(`
      INSERT INTO installment_ledgers (id, "clientPackageId", "dueDate", "amountDue", "amountPaid", "paymentDate", status, "createdAt", "updatedAt") VALUES
      -- NexBridge
      ('LED-NEX-01', 'PKG-001', '2026-01-15', 3500000, 3500000, '2026-01-14', 'PAID', NOW(), NOW()),
      ('LED-NEX-02', 'PKG-001', '2026-02-28', 2500000, 2500000, '2026-02-27', 'PAID', NOW(), NOW()),
      ('LED-NEX-03', 'PKG-001', '2026-04-15', 2000000, 1605000, '2026-04-10', 'PAID', NOW(), NOW()),
      ('LED-NEX-04', 'PKG-001', '2026-06-30', 1750000, NULL, NULL, 'PENDING', NOW(), NOW()),

      -- BGComm
      ('LED-BGC-01', 'PKG-002', '2026-02-05', 5500000, 5500000, '2026-02-04', 'PAID', NOW(), NOW()),
      ('LED-BGC-02', 'PKG-002', '2026-03-20', 4490000, 4490000, '2026-03-18', 'PAID', NOW(), NOW()),
      ('LED-BGC-03', 'PKG-002', '2026-05-15', 4500000, NULL, NULL, 'PENDING', NOW(), NOW()),
      ('LED-BGC-04', 'PKG-002', '2026-07-31', 4010000, NULL, NULL, 'PENDING', NOW(), NOW()),

      -- RedBin
      ('LED-RED-01', 'PKG-003', '2025-11-20', 2500000, 2500000, '2025-11-18', 'PAID', NOW(), NOW()),
      ('LED-RED-02', 'PKG-003', '2026-01-15', 2000000, 2000000, '2026-01-12', 'PAID', NOW(), NOW()),
      ('LED-RED-03', 'PKG-003', '2026-03-01', 1204000, 1204000, '2026-02-28', 'PAID', NOW(), NOW()),
      ('LED-RED-04', 'PKG-003', '2026-04-30', 496000, NULL, NULL, 'PENDING', NOW(), NOW()),

      -- Owl Creative
      ('LED-OWL-01', 'PKG-004', '2026-03-05', 1365000, 1365000, '2026-03-04', 'PAID', NOW(), NOW()),
      ('LED-OWL-02', 'PKG-004', '2026-04-20', 1365000, NULL, NULL, 'PENDING', NOW(), NOW()),
      ('LED-OWL-03', 'PKG-004', '2026-06-15', 1170000, NULL, NULL, 'PENDING', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert Title/Permit tracker for clients
    await pool.query(`
      INSERT INTO title_permit_trackers (id, "clientPackageId", "currentPhase", "motherTitleVerified", "darClearanceApproved", "lguPermitIssued", "dhsudLicenseToSell", "legalPermitsApproved", "ctsSigned", "deedOfSaleSigned", "birEcarIssued", "taxDeclarationTransferred", "landTitleReleased", "registryOfDeedsTctReleased", "certificateOfAcceptanceSigned", "tctNumber", "taxDecNumber", "createdAt", "updatedAt") VALUES
      ('TRK-001', 'PKG-001', 'Fit-Out MEPFS Clearance & CTS Sign-Off', true, true, true, true, true, true, false, false, false, false, false, false, 'PEZA-CTS-2026-081', 'TD-CAB-2026-441', NOW(), NOW()),
      ('TRK-002', 'PKG-002', 'PEZA Electrical & Chiller Clearance', true, true, true, true, true, true, false, false, false, false, false, false, 'PEZA-CTS-2026-092', 'TD-BGC-2026-902', NOW(), NOW()),
      ('TRK-003', 'PKG-003', 'Pre-Handover Architectural Punch-List', true, true, true, true, true, true, true, true, true, false, false, false, 'TCT-2026-091823', 'TD-STA-2026-339', NOW(), NOW()),
      ('TRK-004', 'PKG-004', 'LGU Building Permit & Acoustic Isolation', true, true, true, true, true, true, false, false, false, false, false, false, 'CTS-CAB-2026-118', 'TD-CAB-2026-558', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 8. Seed labor_allocations table
  const allocCount = await pool.query('SELECT count(*) FROM labor_allocations');
  if (parseInt(allocCount.rows[0].count, 10) === 0) {
    console.log('Seeding labor_allocations table...');
    await pool.query(`
      INSERT INTO labor_allocations (id, contractor_id, contractor_name, sector_name, target_lots, assigned_headcount, work_scope, status, notes) VALUES
      ('ALLOC-001', 'CONT-001', 'SolidFoundations Engineering', 'Sector 1 (NexBridge Tech Wing)', 'NexBridge Floor 4 Quadrant A', 14, 'Acoustic Drywall Stud Framing & Casework Millwork', 'ACTIVE', 'Stationed at Cabuyao Technopark.'),
      ('ALLOC-002', 'CONT-002', 'ElectroTech Systems', 'Sector 2 (NexBridge Structured Cabling)', 'NexBridge Floor 4 Quadrant B', 12, 'Category 6A Cable Run & Secondary Subpanel Wiring', 'ACTIVE', 'Zero high-voltage incidents; PPE compliant.'),
      ('ALLOC-003', 'CONT-003', 'HVAC AirFlow Dynamics', 'Sector 3 (BGComm Server Room)', 'BGComm Data Center Pod 1-4', 10, '30-Ton Precision Chilled Airflow Ducting & Balancing', 'ACTIVE', 'Pressure test scheduled with facility management.'),
      ('ALLOC-004', 'CONT-004', 'AcousticWall Drywallers', 'Sector 4 (RedBin Executive Suite)', 'RedBin Boardroom & Telepresence', 8, 'Custom Acoustic Walnut Ceiling Grid & Wall Paneling', 'ACTIVE', 'Final staining and lacquer application in progress.')
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 9. Seed ai_manpower_recommendations table
  const recCount = await pool.query('SELECT count(*) FROM ai_manpower_recommendations');
  if (parseInt(recCount.rows[0].count, 10) === 0) {
    console.log('Seeding ai_manpower_recommendations table...');
    await pool.query(`
      INSERT INTO ai_manpower_recommendations (id, title, target_lots, contractor_id, contractor_name, current_headcount, recommended_headcount, rationale, priority, applied) VALUES
      ('REC-001', 'Shift 4 Electricians from NexBridge to BGComm High-Density Chiller', 'BGComm Data Center', 'CONT-002', 'ElectroTech Systems', 12, 16, 'NexBridge structured cabling rough-in is 85% complete and ahead of schedule. BGComm 250kVA main breaker arrival requires electrical hands to maintain handover deadline.', 'HIGH', false),
      ('REC-002', 'Deploy 2 Additional Artisans to RedBin Executive Boardroom Slats', 'RedBin Boardroom', 'CONT-001', 'SolidFoundations Engineering', 14, 16, 'RedBin target handover is in 25 days. Adding 2 master wood artisans will compress ceiling installation timeline by 6 operational days.', 'MEDIUM', false),
      ('REC-003', 'Rebalance Acoustic Drywall Crew for Owl Studio Floating Floor', 'Owl Control Room', 'CONT-004', 'AcousticWall Drywallers', 8, 11, 'Acoustic isolation shell requires simultaneous rockwool damping and resilient channel installation to avoid acoustic leakage.', 'HIGH', false)
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 10. Seed daily_manpower_audits table
  const auditsCount = await pool.query('SELECT count(*) FROM daily_manpower_audits');
  if (parseInt(auditsCount.rows[0].count, 10) === 0) {
    console.log('Seeding daily_manpower_audits table...');
    await pool.query(`
      INSERT INTO daily_manpower_audits (id, date, "contractorId", "contractorName", specialty, shift, "claimedHeadcount", "verifiedHeadcount", discrepancy, "assignedSectorOrLot", "supervisorName", "gpsCoordinates", "verificationStatus", "photoEvidenceVerified", remarks, "productivityIndex", "createdAt", "updatedAt") VALUES
      ('AUD-001', NOW(), 'CONT-001', 'SolidFoundations Engineering', 'Architectural Carpentry', 'Morning', 14, 14, 0, 'NexBridge Floor 4 Quadrant A', 'Engr. Ricardo Gomez', '14.2789° N, 121.1245° E', 'VERIFIED_MATCH', true, '14 carpenters and joinery artisans verified on-site with full PPE.', 94.5, NOW(), NOW()),
      ('AUD-002', NOW(), 'CONT-002', 'ElectroTech Systems', 'Commercial Electrical', 'Morning', 12, 12, 0, 'NexBridge Floor 4 Quadrant B', 'Engr. Ricardo Gomez', '14.2789° N, 121.1245° E', 'VERIFIED_MATCH', true, 'Cabling crew logged in at 07:45 AM; roll-call completed.', 92.0, NOW(), NOW()),
      ('AUD-003', NOW(), 'CONT-003', 'HVAC AirFlow Dynamics', 'Precision Chilled HVAC', 'Full Day', 10, 10, 0, 'BGComm Gateway Central Floor 7', 'Arnel Bautista', '14.2921° N, 121.1189° E', 'VERIFIED_MATCH', true, 'Ductwork fabricators active in server room bay.', 91.0, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // 11. Seed project_documents table with commercial CAD and engineering documents
  const docsCount = await pool.query('SELECT count(*) FROM project_documents');
  if (parseInt(docsCount.rows[0].count, 10) <= 1) {
    console.log('Seeding project_documents table...');
    await pool.query(`
      INSERT INTO project_documents (id, title, category, "fileUrl", "fileSize", version, status, "uploadedBy", notes, "createdAt", "updatedAt") VALUES
      ('DOC-001', 'NexBridge Software Hub - Level 4 Architectural Floor Plan.dwg', 'CAD_DRAWING', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', '14.8 MB', '3.2', 'APPROVED', 'Lead Architect Maria Santos', 'AutoCAD 2026 As-Built coordinate blueprint including workstation grid and partition layouts.', NOW(), NOW()),
      ('DOC-002', 'BGComm 1200sqm BPO Center - MEPFS Engineering Single-Line Diagram.pdf', 'STRUCTURAL_PLAN', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', '8.4 MB', '2.1', 'APPROVED', 'Engr. Ricardo Gomez', 'Detailed single-line diagram with 250kVA transformer load schedule and precision chiller wiring.', NOW(), NOW()),
      ('DOC-003', 'RedBin Commercial HQ - Executive Millwork & Acoustic Schedule.xlsx', 'SPECIFICATIONS', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', '4.2 MB', '1.4', 'APPROVED', 'Senior QS Ferdinand Cruz', 'Complete Bill of Quantities (BOQ) with materials takeoff, unit costs, and milestone deliverables.', NOW(), NOW()),
      ('DOC-004', 'PEZA Ecozone Commercial Fit-Out Clearance Certificate.pdf', 'LGU_CLEARANCE', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80', '2.6 MB', '1.0', 'APPROVED', 'Legal & Compliance Officer', 'Official Philippine Economic Zone Authority (PEZA) building and electrical clearance certificate.', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  console.log('✅ Database synchronization complete!');
  await pool.end();
}

syncAllTables().catch(err => {
  console.error('❌ Error syncing tables:', err);
  process.exit(1);
});
