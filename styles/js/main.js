// ================================
// MOBILE NAVIGATION
// ================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("show");

    });

}


// ================================
// BOOKING FORM
// ================================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    // ----------------------------
    // FORM ELEMENTS
    // ----------------------------

    const service = document.getElementById("service");
    const barber = document.getElementById("barber");
    const bookingDate = document.getElementById("bookingDate");
    const bookingTime = document.getElementById("bookingTime");

    const summaryService =
        document.getElementById("summaryService");

    const summaryBarber =
        document.getElementById("summaryBarber");

    const summaryDate =
        document.getElementById("summaryDate");

    const summaryTime =
        document.getElementById("summaryTime");

    const summaryDuration =
        document.getElementById("summaryDuration");

    const summaryPrice =
        document.getElementById("summaryPrice");


    // ----------------------------
    // MODAL ELEMENTS
    // ----------------------------

    const bookingModal =
        document.getElementById("bookingModal");

    const closeBookingModal =
        document.getElementById("closeBookingModal");

    const googleCalendar =
        document.getElementById("googleCalendar");

    const appleCalendar =
        document.getElementById("appleCalendar");


    // ================================
    // PREVENT PAST DATES
    // ================================

    const today = new Date();

    const localToday =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    bookingDate.min = localToday;


    // ================================
    // UPDATE BOOKING SUMMARY
    // ================================

    // SERVICE
    service.addEventListener("change", () => {

        const selectedOption =
            service.options[service.selectedIndex];

        if (service.value) {

            const price =
                selectedOption.dataset.price;

            const duration =
                selectedOption.dataset.duration;

            summaryService.textContent =
                service.value;

            summaryPrice.textContent =
                "R" + price;

            summaryDuration.textContent =
                duration + " min";

        } else {

            summaryService.textContent =
                "Not selected";

            summaryPrice.textContent =
                "R0";

            summaryDuration.textContent =
                "—";

        }

    });


    // BARBER
    barber.addEventListener("change", () => {

        summaryBarber.textContent =
            barber.value || "Not selected";

    });


    // DATE
    bookingDate.addEventListener("change", () => {

        if (!bookingDate.value) {

            summaryDate.textContent =
                "Not selected";

            return;

        }

        const selectedDate =
            new Date(
                bookingDate.value +
                "T00:00:00"
            );

        // JavaScript:
        // Sunday = 0
        if (selectedDate.getDay() === 0) {

            alert(
                "Clip Your Crown is closed on Sundays. Please choose another date."
            );

            bookingDate.value = "";

            summaryDate.textContent =
                "Not selected";

            return;

        }

        summaryDate.textContent =
            bookingDate.value;

    });


    // TIME
    bookingTime.addEventListener("change", () => {

        summaryTime.textContent =
            bookingTime.value ||
            "Not selected";

    });


    // ================================
    // SUBMIT BOOKING
    // ================================

    bookingForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const selectedService =
                service.options[
                    service.selectedIndex
                ];


            const bookingData = {

                customer_name:
                    document
                        .getElementById("customerName")
                        .value
                        .trim(),

                customer_email:
                    document
                        .getElementById("customerEmail")
                        .value
                        .trim(),

                customer_phone:
                    document
                        .getElementById("customerPhone")
                        .value
                        .trim(),

                service:
                    service.value,

                barber:
                    barber.value,

                booking_date:
                    bookingDate.value,

                booking_time:
                    bookingTime.value,

                duration:
                    parseInt(
                        selectedService.dataset.duration
                    ),

                price:
                    parseFloat(
                        selectedService.dataset.price
                    )

            };


            try {

                const response =
                    await fetch(
                        "/api/bookings",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    bookingData
                                )
                        }
                    );


                const result =
                    await response.json();


                // IMPORTANT:
                // Use the actual message returned
                // by the Flask backend.
                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "We couldn't complete your booking."
                    );

                }


                // Booking saved successfully
                showBookingConfirmation(
                    result.booking_id,
                    bookingData
                );


            } catch (error) {

                console.error(
                    "Booking error:",
                    error
                );

                // Show the ACTUAL error message.
                //
                // Duplicate booking:
                // "That barber is already booked..."
                //
                // Sunday:
                // "Clip Your Crown is closed..."
                //
                // Other server error:
                // appropriate backend message
                alert(error.message);

            }

        }
    );


    // ================================
    // SHOW CONFIRMATION MODAL
    // ================================

    function showBookingConfirmation(
        bookingId,
        booking
    ) {

        document
            .getElementById("confirmReference")
            .textContent =
            "#" + bookingId;


        document
            .getElementById("confirmService")
            .textContent =
            booking.service;


        document
            .getElementById("confirmBarber")
            .textContent =
            booking.barber;


        const readableDate =
            new Date(
                booking.booking_date +
                "T00:00:00"
            ).toLocaleDateString(
                "en-ZA",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        document
            .getElementById("confirmDate")
            .textContent =
            readableDate;


        document
            .getElementById("confirmTime")
            .textContent =
            booking.booking_time;


        // Create calendar options
        createGoogleCalendarLink(
            booking
        );


        appleCalendar.onclick = () => {

            downloadCalendarEvent(
                booking
            );

        };


        // Show modal
        bookingModal.classList.add(
            "show"
        );

        document.body.style.overflow =
            "hidden";

    }


    // ================================
    // CLOSE BOOKING MODAL
    // ================================

    closeBookingModal.addEventListener(
        "click",
        () => {

            bookingModal.classList.remove(
                "show"
            );

            document.body.style.overflow =
                "";

        }
    );


    // Close if customer clicks
    // outside the modal
    bookingModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === bookingModal
            ) {

                bookingModal.classList.remove(
                    "show"
                );

                document.body.style.overflow =
                    "";

            }

        }
    );


    // ================================
    // GOOGLE CALENDAR
    // ================================

    function createGoogleCalendarLink(
        booking
    ) {

        const start =
            new Date(
                `${booking.booking_date}T${booking.booking_time}:00`
            );


        const end =
            new Date(
                start.getTime() +
                booking.duration * 60000
            );


        function formatGoogleDate(date) {

            return date
                .toISOString()
                .replace(/[-:]/g, "")
                .replace(/\.\d{3}/, "");

        }


        const title =
            `${booking.service} - Clip Your Crown`;


        const details =
            `Appointment with ${booking.barber} at Clip Your Crown Barbershop.`;


        const location =
            "Clip Your Crown Barbershop, 24 Crown Street, Halfway Gardens, Midrand, Gauteng, 1686";


        const url =
            "https://calendar.google.com/calendar/render?action=TEMPLATE" +

            `&text=${
                encodeURIComponent(title)
            }` +

            `&dates=${
                formatGoogleDate(start)
            }/${
                formatGoogleDate(end)
            }` +

            `&details=${
                encodeURIComponent(details)
            }` +

            `&location=${
                encodeURIComponent(location)
            }`;


        googleCalendar.href =
            url;

    }


    // ================================
    // APPLE / ICS CALENDAR
    // ================================

    function downloadCalendarEvent(
        booking
    ) {

        const start =
            new Date(
                `${booking.booking_date}T${booking.booking_time}:00`
            );


        const end =
            new Date(
                start.getTime() +
                booking.duration * 60000
            );


        function formatICSDate(date) {

            return date
                .toISOString()
                .replace(/[-:]/g, "")
                .replace(/\.\d{3}/, "");

        }


        const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Clip Your Crown//Booking//EN
BEGIN:VEVENT
UID:${Date.now()}@crownandclipper
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:${booking.service} - Clip Your Crown
DESCRIPTION:Appointment with ${booking.barber} at Clip Your Crown Barbershop.
LOCATION:Clip Your Crown Barbershop, 24 Crown Street, Halfway Gardens, Midrand, Gauteng, 1686
END:VEVENT
END:VCALENDAR`;


        const blob =
            new Blob(
                [icsContent],
                {
                    type:
                        "text/calendar;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "crown-and-clipper-appointment.ics";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }

}

// ================================
// MONTH-END PROMOTION
// ================================

const promoModal =
    document.getElementById("promoModal");

const closePromo =
    document.getElementById("closePromo");

const declinePromo =
    document.getElementById("declinePromo");


if (promoModal) {

    // Show popup every time the homepage loads
    setTimeout(() => {

        promoModal.classList.add("show");

        document.body.style.overflow =
            "hidden";

    }, 1500);


    function closePromoModal() {

        promoModal.classList.remove("show");

        document.body.style.overflow =
            "";

    }


    // Close using X button
    if (closePromo) {

        closePromo.addEventListener(
            "click",
            closePromoModal
        );

    }


    // Close using "Maybe next time"
    if (declinePromo) {

        declinePromo.addEventListener(
            "click",
            closePromoModal
        );

    }


    // Close by clicking outside popup
    promoModal.addEventListener(
        "click",
        (event) => {

            if (event.target === promoModal) {

                closePromoModal();

            }

        }
    );


    // Close using Escape key
    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                promoModal.classList.contains("show")
            ) {

                closePromoModal();

            }

        }
    );

}


// ================================
// GALLERY LIGHTBOX
// ================================

const galleryImages =
    document.querySelectorAll(
        ".gallery-clickable"
    );

const imageLightbox =
    document.getElementById(
        "imageLightbox"
    );

const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );

const lightboxClose =
    document.getElementById(
        "lightboxClose"
    );


if (
    imageLightbox &&
    lightboxImage &&
    lightboxClose
) {

    galleryImages.forEach(
        (image) => {

            image.addEventListener(
                "click",
                () => {

                    lightboxImage.src =
                        image.src;

                    lightboxImage.alt =
                        image.alt;

                    imageLightbox.classList.add(
                        "show"
                    );

                    document.body.style.overflow =
                        "hidden";

                }
            );

        }
    );


    function closeLightbox() {

        imageLightbox.classList.remove(
            "show"
        );

        document.body.style.overflow =
            "";

        lightboxImage.src =
            "";

    }


    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );


    imageLightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                imageLightbox
            ) {

                closeLightbox();

            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                imageLightbox.classList.contains(
                    "show"
                )
            ) {

                closeLightbox();

            }

        }
    );

}
