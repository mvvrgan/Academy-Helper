window.onload = async function () {
    const { value: text } = await Swal.fire({
        input: 'text',
        icon: 'info',
        title: 'Please enter your ROBLOX username',
        inputPlaceholder: 'Username',
        inputAttributes: {
            'aria-label': 'Type your message here'
        },
        confirmButtonText: "Continue",
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
    })

    if (text) {

    }
}