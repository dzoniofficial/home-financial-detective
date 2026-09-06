const candidate = {
  name: form.name,
  amount: Number(form.amount),
  currency: form.currency,
  billing_cycle: form.billing_cycle,
  start_date: form.start_date || null,
  renewal_date: form.renewal_date,
  category: form.category,
  status: form.status,
  notes: form.notes || null,
};
