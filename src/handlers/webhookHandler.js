import { getEmployee, getEmployer } from '../services/onboarded.js';
import verifyWebhookToken from '../middleware/auth.js';
import upsertComplianceRecord from '../services/airtableClient.js';

export const handleWebhook = async (req, res) => {
  const token = req.headers['x-onboarded-token'];
  if (!verifyWebhookToken(token)) {
    console.warn('Webhook received with invalid token');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body;

  if (!event || !event.data) {
    return res.status(200).json({
      received: true,
      action: 'ignored',
      reason: 'malformed payload'
    });
  }

  const task = event.data;

  if (event.type !== 'task.updated') {
    return res.status(200).json({
      received: true,
      action: 'ignored',
      reason: 'not task.updated'
    });
  }

  if (task.status !== 'completed') {
    return res.status(200).json({
      received: true,
      action: 'ignored',
      reason: `status is ${task.status}`
    });
  }

  console.log(
    `Processing completed task: ${task.id} for employee: ${task.employee_id}`
  );

  try {
    const [employee, employer] = await Promise.allSettled([
      getEmployee(task.employee_id),
      getEmployer(task.employer_id)
    ]);

    const employeeData =
      employee.status === 'fulfilled' ? employee.value : null;
    const employerData =
      employer.status === 'fulfilled' ? employer.value : null;

    if (!employeeData) {
      console.warn(
        `Could not fetch employee ${task.employee_id} - writing record without enrichment`
      );
    }
    if (!employerData) {
      console.warn(
        `Could not fetch employer ${task.employer_id} - writing record without enrichment`
      );
    }

    const record = buildRecord(task, employeeData, employerData);
    await upsertComplianceRecord(record);

    console.log(`Airtable record upserted for task: ${task.id}`);
    return res
      .status(200)
      .json({ received: true, action: 'upserted', taskId: task.id });
  } catch (err) {
    console.error(`Failed to process task ${task.id}:`, err.message);
    return res
      .status(200)
      .json({ received: true, action: 'failed', error: err.message });
  }
};

export const buildRecord = (task, employee, employer) => ({
  task_id: task.id,
  task_name: task.name ?? 'Unknown Form',
  employee_id: task.employee_id,
  employee_name: employee
    ? `${employee.first_name} ${employee.last_name}`.trim()
    : 'Unknown',
  employee_email: employee?.email ?? '',
  employer_id: task.employer_id,
  employer_name: employer?.name ?? 'Unknown',
  status: task.status,
  progress_percent: task.progress?.percent ?? 100,
  completed_at: task.completed_at,
  created_at: task.created_at
});
