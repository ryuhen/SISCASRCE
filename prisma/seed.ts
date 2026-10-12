import { PrismaClient } from '@prisma/client';
import {
  INITIAL_USERS,
  INITIAL_SEDES,
  INITIAL_PNFS,
  INITIAL_PERIODS,
  INITIAL_PER_RECOVERIES,
  INITIAL_CURRICULAR_UNITS,
  INITIAL_SECTIONS,
  INITIAL_CLASS_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_EVALUATION_PLAN,
  INITIAL_GRADES,
  INITIAL_OBSERVATIONS,
  INITIAL_ENROLLMENTS,
  INITIAL_PRE_REGISTRATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EVALUATION_ENGINE,
  INITIAL_DRIVE_STORAGE,
} from '../src/mock/initialData.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with SISCASRCE domain data...');

  // 1. Users
  for (const u of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        cedula: u.cedula,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        pnfId: u.pnfId || null,
        sedeId: u.sedeId || null,
        avatar: u.avatar,
        title: u.title || null,
        status: u.status,
      },
    });
  }

  // 2. Sedes
  for (const s of INITIAL_SEDES) {
    await prisma.sede.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        code: s.code,
        name: s.name,
        city: s.city,
        address: s.address,
        phone: s.phone,
        pnfIdsOfferedJson: JSON.stringify(s.pnfIdsOffered),
        carsceCoordinatorId: s.carsceCoordinatorId || null,
        pnfCoordinatorsMapJson: s.pnfCoordinatorsMap ? JSON.stringify(s.pnfCoordinatorsMap) : null,
      },
    });
  }

  // 3. PNFs
  for (const p of INITIAL_PNFS) {
    await prisma.pNF.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        code: p.code,
        name: p.name,
        modality: p.modality,
        tramosPerTrayecto: p.tramosPerTrayecto,
        totalTrayectos: p.totalTrayectos,
        description: p.description,
        sedeIdsJson: JSON.stringify(p.sedeIds),
        coordinatorId: p.coordinatorId,
        colorThemeJson: JSON.stringify(p.colorTheme),
      },
    });
  }

  // 4. Academic Periods
  for (const period of INITIAL_PERIODS) {
    await prisma.academicPeriod.upsert({
      where: { id: period.id },
      update: {},
      create: {
        id: period.id,
        code: period.code,
        name: period.name,
        year: period.year,
        type: period.type,
        season: period.season || null,
        startDate: period.startDate,
        endDate: period.endDate,
        isCurrent: period.isCurrent,
        status: period.status,
        recoveryNotesClosingRequired: period.recoveryNotesClosingRequired || false,
        notesClosingStatus: period.notesClosingStatus || 'Pendiente',
        perRegistrationOpen: period.perRegistrationOpen || false,
      },
    });
  }

  // 5. PER Records
  for (const rec of INITIAL_PER_RECOVERIES) {
    await prisma.perRecoveryRecord.upsert({
      where: { id: rec.id },
      update: {},
      create: {
        id: rec.id,
        periodId: rec.periodId,
        studentId: rec.studentId,
        curricularUnitId: rec.curricularUnitId,
        sectionCode: rec.sectionCode || null,
        originalPeriodCode: rec.originalPeriodCode,
        originalScore: rec.originalScore,
        recoveryScore: rec.recoveryScore || null,
        recoveryStatus: rec.recoveryStatus,
        evaluationDate: rec.evaluationDate || null,
        teacherObservation: rec.teacherObservation || null,
        evaluatorId: rec.evaluatorId || null,
        evaluatorName: rec.evaluatorName || null,
        updatedAt: rec.updatedAt,
      },
    });
  }

  // 6. Curricular Units
  for (const cu of INITIAL_CURRICULAR_UNITS) {
    await prisma.curricularUnit.upsert({
      where: { id: cu.id },
      update: {},
      create: {
        id: cu.id,
        pnfId: cu.pnfId,
        code: cu.code,
        name: cu.name,
        trayecto: cu.trayecto,
        tramo: cu.tramo,
        horasAcademicasSemanales: cu.horasAcademicasSemanales,
        totalPlannedSessions: cu.totalPlannedSessions,
        isProject: cu.isProject,
        synopsis: cu.synopsis || null,
        unitsContentJson: cu.unitsContent ? JSON.stringify(cu.unitsContent) : null,
        sedeIdsJson: cu.sedeIds ? JSON.stringify(cu.sedeIds) : null,
      },
    });
  }

  // 7. Sections
  for (const sec of INITIAL_SECTIONS) {
    await prisma.section.upsert({
      where: { id: sec.id },
      update: {},
      create: {
        id: sec.id,
        curricularUnitId: sec.curricularUnitId,
        pnfId: sec.pnfId,
        sedeId: sec.sedeId,
        code: sec.code,
        periodId: sec.periodId,
        trayecto: sec.trayecto,
        tramo: sec.tramo,
        professorId: sec.professorId,
        assistantId: sec.assistantId || null,
        maxCapacity: sec.maxCapacity,
        shift: sec.shift,
        schedulesJson: JSON.stringify(sec.schedules),
        actaStatus: sec.actaStatus,
      },
    });
  }

  // 8. Class Sessions
  for (const cs of INITIAL_CLASS_SESSIONS) {
    await prisma.classSession.upsert({
      where: { id: cs.id },
      update: {},
      create: {
        id: cs.id,
        sectionId: cs.sectionId,
        sessionNumber: cs.sessionNumber,
        date: cs.date,
        topic: cs.topic,
        objective: cs.objective,
        registeredBy: cs.registeredBy,
        registeredAt: cs.registeredAt,
        isCompleted: cs.isCompleted,
        notes: cs.notes || null,
      },
    });
  }

  // 9. Attendance
  for (const att of INITIAL_ATTENDANCE_RECORDS) {
    await prisma.attendanceRecord.upsert({
      where: { id: att.id },
      update: {},
      create: {
        id: att.id,
        sessionId: att.sessionId,
        sectionId: att.sectionId,
        studentId: att.studentId,
        status: att.status,
        justificationReason: att.justificationReason || null,
        updatedAt: att.updatedAt,
      },
    });
  }

  // 10. Evaluation Items
  for (const ev of INITIAL_EVALUATION_PLAN) {
    await prisma.evaluationPlanItem.upsert({
      where: { id: ev.id },
      update: {},
      create: {
        id: ev.id,
        sectionId: ev.sectionId,
        corteNumber: ev.corteNumber,
        title: ev.title,
        weightPercentage: ev.weightPercentage,
        maxScore: ev.maxScore,
        instrument: ev.instrument,
        dueDate: ev.dueDate,
        isPublished: ev.isPublished,
      },
    });
  }

  // 11. Grades
  for (const gr of INITIAL_GRADES) {
    await prisma.gradeRecord.upsert({
      where: { id: gr.id },
      update: {},
      create: {
        id: gr.id,
        evaluationPlanItemId: gr.evaluationPlanItemId,
        sectionId: gr.sectionId,
        studentId: gr.studentId,
        score: gr.score,
        feedback: gr.feedback || null,
        updatedBy: gr.updatedBy,
        updatedAt: gr.updatedAt,
      },
    });
  }

  // 12. Student Observations
  for (const obs of INITIAL_OBSERVATIONS) {
    await prisma.studentObservation.upsert({
      where: { id: obs.id },
      update: {},
      create: {
        id: obs.id,
        studentId: obs.studentId,
        sectionId: obs.sectionId,
        date: obs.date,
        category: obs.category,
        note: obs.note,
        recommendationCouncil: obs.recommendationCouncil,
        authorId: obs.authorId,
        authorName: obs.authorName,
        createdAt: obs.createdAt,
      },
    });
  }

  // 13. Enrollments
  for (const enr of INITIAL_ENROLLMENTS) {
    await prisma.enrollment.upsert({
      where: { id: enr.id },
      update: {},
      create: {
        id: enr.id,
        studentId: enr.studentId,
        sectionId: enr.sectionId,
        periodId: enr.periodId,
        status: enr.status,
        enrollmentDate: enr.enrollmentDate,
        finalGrade: enr.finalGrade ?? null,
      },
    });
  }

  // 14. PreRegistrations
  for (const pr of INITIAL_PRE_REGISTRATIONS) {
    await prisma.preRegistration.upsert({
      where: { id: pr.id },
      update: {},
      create: {
        id: pr.id,
        cedula: pr.cedula,
        firstName: pr.firstName,
        lastName: pr.lastName,
        email: pr.email,
        phone: pr.phone,
        pnfId: pr.pnfId,
        sedeId: pr.sedeId,
        birthDate: pr.birthDate,
        highSchool: pr.highSchool,
        graduationYear: pr.graduationYear,
        address: pr.address,
        shiftPreference: pr.shiftPreference,
        status: pr.status,
        reviewNotes: pr.reviewNotes || null,
        documentsJson: JSON.stringify(pr.documents),
        createdAt: pr.createdAt,
        reviewedBy: pr.reviewedBy || null,
        reviewedAt: pr.reviewedAt || null,
      },
    });
  }

  // 15. System Notifications
  for (const notif of INITIAL_NOTIFICATIONS) {
    await prisma.systemNotification.upsert({
      where: { id: notif.id },
      update: {},
      create: {
        id: notif.id,
        targetRole: notif.targetRole || null,
        targetUserId: notif.targetUserId || null,
        targetPnfId: notif.targetPnfId || null,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        createdAt: notif.createdAt,
        read: notif.read,
        category: notif.category,
      },
    });
  }

  // 16. System Configurations
  await prisma.systemConfig.upsert({
    where: { key: 'evaluation_engine' },
    update: { value: JSON.stringify(INITIAL_EVALUATION_ENGINE) },
    create: { key: 'evaluation_engine', value: JSON.stringify(INITIAL_EVALUATION_ENGINE) },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'drive_storage' },
    update: { value: JSON.stringify(INITIAL_DRIVE_STORAGE) },
    create: { key: 'drive_storage', value: JSON.stringify(INITIAL_DRIVE_STORAGE) },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
