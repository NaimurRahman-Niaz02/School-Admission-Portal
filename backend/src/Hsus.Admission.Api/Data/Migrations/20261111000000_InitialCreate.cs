using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hsus.Admission.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admission_classes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Grade = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Shift = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Group = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AcademicSession = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TotalSeats = table.Column<int>(type: "integer", nullable: false),
                    FeeAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    AdmissionStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdmissionEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admission_classes", x => x.Id);
                    table.CheckConstraint("CK_AdmissionClasses_FeeAmount_NonNegative", "\"FeeAmount\" >= 0");
                    table.CheckConstraint("CK_AdmissionClasses_TotalSeats_Positive", "\"TotalSeats\" > 0");
                });

            migrationBuilder.CreateTable(
                name: "students",
                columns: table => new
                {
                    BirthRegistrationNumber = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_students", x => x.BirthRegistrationNumber);
                    table.CheckConstraint("CK_Students_BirthRegistrationNumber_17Digits", "\"BirthRegistrationNumber\" ~ '^[0-9]{17}$'");
                });

            migrationBuilder.CreateTable(
                name: "admission_holds",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ApplicationCode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ClassId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    StudentId = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admission_holds", x => x.Id);
                    table.CheckConstraint("CK_AdmissionHolds_Status", "\"Status\" IN ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED')");
                    table.ForeignKey(
                        name: "FK_admission_holds_admission_classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "admission_classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_admission_holds_students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "students",
                        principalColumn: "BirthRegistrationNumber",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionClasses_Grade_Shift_Group_AcademicSession",
                table: "admission_classes",
                columns: new[] { "Grade", "Shift", "Group", "AcademicSession" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionClasses_Name_AcademicSession",
                table: "admission_classes",
                columns: new[] { "Name", "AcademicSession" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_ApplicationCode",
                table: "admission_holds",
                column: "ApplicationCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_ClassId_Status_ExpiresAt",
                table: "admission_holds",
                columns: new[] { "ClassId", "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_Status_ExpiresAt",
                table: "admission_holds",
                columns: new[] { "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_StudentId_ActiveOrConfirmed",
                table: "admission_holds",
                column: "StudentId",
                unique: true,
                filter: "\"Status\" IN ('HELD', 'CONFIRMED')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admission_holds");

            migrationBuilder.DropTable(
                name: "admission_classes");

            migrationBuilder.DropTable(
                name: "students");
        }
    }
}

