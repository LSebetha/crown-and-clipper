import os

import psycopg2

from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from datetime import datetime


# Load environment variables
load_dotenv()


app = Flask(
    __name__,
    static_folder="styles",
    static_url_path="/styles"
)


DATABASE_URL = os.getenv("DATABASE_URL")


# ================================
# PAGE ROUTES
# ================================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/services")
def services():
    return render_template("services.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/terms")
def terms():
    return render_template("terms.html")


# ================================
# BOOKING API
# ================================

@app.route("/api/bookings", methods=["POST"])
def create_booking():

    data = request.get_json()

    required_fields = [
        "customer_name",
        "customer_email",
        "customer_phone",
        "service",
        "barber",
        "booking_date",
        "booking_time",
        "duration",
        "price"
    ]


    # Check required fields
    for field in required_fields:

        if not data.get(field):

            return jsonify({
                "success": False,
                "message": f"Missing required field: {field}"
            }), 400


    # ================================
    # PREVENT SUNDAY BOOKINGS
    # ================================

    booking_date = datetime.strptime(
        data["booking_date"],
        "%Y-%m-%d"
    )

    # Python weekday:
    # Monday = 0
    # Sunday = 6

    if booking_date.weekday() == 6:

        return jsonify({
            "success": False,
            "message":
                "Clip Your Crown is closed on Sundays. "
                "Please choose another date."
        }), 400


    connection = None
    cursor = None


    try:

        connection = psycopg2.connect(DATABASE_URL)

        cursor = connection.cursor()


        # ================================
        # CHECK BARBER AVAILABILITY
        # ================================

        cursor.execute(
            """
            SELECT id
            FROM bookings
            WHERE barber = %s
              AND booking_date = %s
              AND booking_time = %s
            LIMIT 1;
            """,
            (
                data["barber"],
                data["booking_date"],
                data["booking_time"]
            )
        )


        existing_booking = cursor.fetchone()


        if existing_booking:

            return jsonify({
                "success": False,
                "message":
                    "That barber is already booked at this time. "
                    "Please choose another time or barber."
            }), 409


        # ================================
        # CREATE BOOKING
        # ================================

        cursor.execute(
            """
            INSERT INTO bookings (
                customer_name,
                customer_email,
                customer_phone,
                service,
                barber,
                booking_date,
                booking_time,
                duration,
                price
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
            RETURNING id;
            """,
            (
                data["customer_name"],
                data["customer_email"],
                data["customer_phone"],
                data["service"],
                data["barber"],
                data["booking_date"],
                data["booking_time"],
                data["duration"],
                data["price"]
            )
        )


        booking_id = cursor.fetchone()[0]

        connection.commit()


        return jsonify({
            "success": True,
            "message": "Appointment booked successfully.",
            "booking_id": booking_id
        }), 201


    except Exception as error:

        if connection:
            connection.rollback()

        print("BOOKING ERROR:", error)

        return jsonify({
            "success": False,
            "message":
                "We could not complete your booking."
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ================================
# RUN APPLICATION
# ================================

if __name__ == "__main__":
    app.run(debug=True)
