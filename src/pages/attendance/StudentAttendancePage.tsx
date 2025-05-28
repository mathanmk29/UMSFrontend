import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart4 } from "lucide-react";

const StudentAttendancePage = () => {
  const [studentName] = useState("John Doe");
  const [selectedSemester, setSelectedSemester] = useState("");

  // Simulated session data per semester
  const sessionAttendanceBySemester = {
    "Semester 1": { FN: { conducted: 40, attended: 32 }, AN: { conducted: 30, attended: 22 } },
    "Semester 2": { FN: { conducted: 42, attended: 36 }, AN: { conducted: 28, attended: 25 } },
    "Semester 3": { FN: { conducted: 35, attended: 30 }, AN: { conducted: 20, attended: 15 } },
    "Semester 4": { FN: { conducted: 0, attended: 0 }, AN: { conducted: 0, attended: 0 } },
    "Semester 5": { FN: { conducted: 0, attended: 0 }, AN: { conducted: 0, attended: 0 } },
    "Semester 6": { FN: { conducted: 0, attended: 0 }, AN: { conducted: 0, attended: 0 } },
    "Semester 7": { FN: { conducted: 0, attended: 0 }, AN: { conducted: 0, attended: 0 } },
    "Semester 8": { FN: { conducted: 0, attended: 0 }, AN: { conducted: 0, attended: 0 } },
  };

  const getOverallPercentage = () => {
    const sessionData = sessionAttendanceBySemester[selectedSemester];
    if (!sessionData) return null;

    const totalConducted = sessionData.FN.conducted + sessionData.AN.conducted;
    const totalAttended = sessionData.FN.attended + sessionData.AN.attended;

    if (totalConducted === 0) return 0;

    return Math.round((totalAttended / totalConducted) * 100); // Rounded to integer
  };

  const dynamicOverallPercentage = selectedSemester ? getOverallPercentage() ?? 0 : 0;

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { text: "Excellent", color: "text-green-600" };
    if (percentage >= 80) return { text: "Good", color: "text-green-500" };
    if (percentage >= 75) return { text: "Satisfactory", color: "text-yellow-600" };
    return { text: "Needs Improvement", color: "text-red-500" };
  };

  const attendanceStatus = getAttendanceStatus(dynamicOverallPercentage);

  const semesters = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  return (
    <>
      <Navbar userType="student" userName={studentName} />
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
          <p className="text-secondary mt-2">Track your attendance statistics</p>
        </div>

        <div className="mb-6">
          <Label htmlFor="semester">Select a semester to view your attendance details for that semester.</Label>
          <div>
            <br />
          </div>
          <div className="max-w-xs">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-3">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-20 w-20 rounded-full border-4 border-primary flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold">{dynamicOverallPercentage}%</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Overall Attendance</h3>
                    <p className={`text-sm ${attendanceStatus.color}`}>{attendanceStatus.text}</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-secondary">Required</p>
                    <p className="text-2xl font-bold">75%</p>
                    <p className="text-xs text-secondary">Minimum</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-secondary">Current</p>
                    <p className="text-2xl font-bold">{dynamicOverallPercentage}%</p>
                    <p className="text-xs text-secondary">Attendance</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-secondary">Risk Status</p>
                    <p className={`text-2xl font-bold ${dynamicOverallPercentage >= 75 ? "text-green-500" : "text-red-500"}`}>
                      {dynamicOverallPercentage >= 75 ? "Safe" : "At Risk"}
                    </p>
                    <p className="text-xs text-secondary">Status</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FN & AN Session */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart4 size={20} className="mr-2" />
                Session-Based Attendance Overview
              </CardTitle>
              <CardDescription>Breakdown by FN & AN session</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSemester ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <h4 className="font-semibold mb-1">FN Session</h4>
                    <p>
                      Total FN Sessions Conducted:{" "}
                      <strong>{sessionAttendanceBySemester[selectedSemester].FN.conducted}</strong>
                    </p>
                    <p>
                      Total FN Sessions Attended:{" "}
                      <strong>{sessionAttendanceBySemester[selectedSemester].FN.attended}</strong>
                    </p>
                    <p>
                      Attendance %:{" "}
                      <strong className="text-green-600">
                        {(
                          (sessionAttendanceBySemester[selectedSemester].FN.attended /
                            sessionAttendanceBySemester[selectedSemester].FN.conducted) *
                          100 || 0
                        ).toFixed(2)}
                        %
                      </strong>
                    </p>
                  </div>

                  <div className="border rounded-md p-4 bg-muted/30">
                    <h4 className="font-semibold mb-1">AN Session</h4>
                    <p>
                      Total AN Sessions Conducted:{" "}
                      <strong>{sessionAttendanceBySemester[selectedSemester].AN.conducted}</strong>
                    </p>
                    <p>
                      Total AN Sessions Attended:{" "}
                      <strong>{sessionAttendanceBySemester[selectedSemester].AN.attended}</strong>
                    </p>
                    <p>
                      Attendance %:{" "}
                      <strong className="text-yellow-600">
                        {(
                          (sessionAttendanceBySemester[selectedSemester].AN.attended /
                            sessionAttendanceBySemester[selectedSemester].AN.conducted) *
                          100 || 0
                        ).toFixed(2)}
                        %
                      </strong>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Please select a semester to view session data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StudentAttendancePage;
