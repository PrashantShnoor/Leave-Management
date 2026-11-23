const logActivity = async (client, {
    action,
    performed_by,
    employee_id,
    description,
    entity_type = null,
    entity_id = null,
    old_value = null,
    new_value = null,
}) => {

    const query = `
        INSERT INTO activity_logs (
            action,
            performed_by,
            employee_id,
            description,
            entity_type,
            entity_id,
            old_value,
            new_value
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const values = [
        action,
        performed_by,
        employee_id,
        description,
        entity_type,
        entity_id,
        old_value,
        new_value
    ];

    const result = await client.query(query, values);

    return result.rows[0];
};

export default logActivity;
