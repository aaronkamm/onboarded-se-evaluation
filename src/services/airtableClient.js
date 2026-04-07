const getBaseUrl = () =>
  `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;

const getTableName = () => process.env.AIRTABLE_TABLE_NAME;

const getHeaders = ({ json = false } = {}) => {
  const headers = {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
  };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
};

const toAirtableFields = (record) => ({
  'Task ID': record.task_id,
  'Task Name': record.task_name,
  'Employee ID': record.employee_id,
  'Employee Name': record.employee_name,
  'Employee Email': record.employee_email,
  'Employer ID': record.employer_id,
  'Employer Name': record.employer_name,
  Status: record.status,
  'Completed At': record.completed_at,
  'Created At': record.created_at
});

const findExistingRecord = async (taskId) => {
  const formula = encodeURIComponent(`{Task ID} = "${taskId}"`);
  const url = `${getBaseUrl()}/${encodeURIComponent(getTableName())}?filterByFormula=${formula}&maxRecords=1`;

  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    throw new Error(`Airtable search failed: ${res.status}`);
  }

  const data = await res.json();
  return data.records?.[0]?.id ?? null;
};

const createRecord = async (fields) => {
  const url = `${getBaseUrl()}/${encodeURIComponent(getTableName())}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders({ json: true }),
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable create failed: ${res.status} ${body}`);
  }

  return res.json();
};

const updateRecord = async (airtableRecordId, fields) => {
  const url = `${getBaseUrl()}/${encodeURIComponent(getTableName())}/${airtableRecordId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders({ json: true }),
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable update failed: ${res.status} ${body}`);
  }

  return res.json();
};

const upsertComplianceRecord = async (record) => {
  const fields = toAirtableFields(record);
  const existingId = await findExistingRecord(record.task_id);

  if (existingId) {
    console.log(
      `Updating existing Airtable record ${existingId} for task ${record.task_id}`
    );
    return updateRecord(existingId, fields);
  }

  console.log(`Creating new Airtable record for task ${record.task_id}`);
  return createRecord(fields);
};

export default upsertComplianceRecord;
