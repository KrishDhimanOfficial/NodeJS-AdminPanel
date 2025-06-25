const validate = (res, error) => {
    const errors = Object.values(error).map((err) => err.message)
    return res.status(400).json({ errors })
}

export default validate