import React, { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AttendanceRecord {
  id: number;
  date: string;
  department: string;
  batch: string;
  course: string;
  semester: string;
  session: string;
  students: {
    id: number;
    name: string;
    rollNumber: string;
    isPresent: boolean;
  }[];
}

const departments = ["Computer Science", "Information Technology", "Electrical Engineering"];
const courses = ["Data Structures", "Algorithms", "Database Systems"];
const batches = ["2021", "2022", "2023", "2024", "2025"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
const sessions = ["FN", "AN"];

const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const randomNames = [
  "Ava Patel", "Liam Smith", "Olivia Johnson", "Noah Williams", "Emma Brown",
  "Elijah Jones", "Sophia Garcia", "Lucas Miller", "Mia Davis", "Mason Rodriguez",
  "Charlotte Martinez", "Logan Hernandez", "Amelia Lopez", "James Gonzalez", "Harper Wilson"
];

const deptCodes: Record<string, string> = {
  "Computer Science": "CS",
  "Information Technology": "IT",
  "Electrical Engineering": "EE"
};

// Generate mock attendance records for the past 7 days, all combinations for realistic filter testing
const mockAttendanceRecords: AttendanceRecord[] = [];
let recordId = 1;
for (let day = 0; day < 7; day++) {
  const date = getPastDate(day);
  for (const department of departments) {
    for (const course of courses) {
      for (const batch of batches) {
        for (const semester of semesters) {
          for (const session of sessions) {
            if (
              (department === "Computer Science" && course === "Data Structures" && batch === "2022" && semester === "5") ||
              (department === "Information Technology" && course === "Algorithms" && batch === "2023" && semester === "3") ||
              (department === "Electrical Engineering" && course === "Database Systems" && batch === "2024" && semester === "1")
            ) {
              mockAttendanceRecords.push({
                id: recordId++,
                date,
                department,
                course,
                batch,
                semester,
                session,
                students: Array.from({ length: 15 }).map((_, i) => ({
                  id: i + 1,
                  name: randomNames[i],
                  rollNumber: `${deptCodes[department]}${batch.slice(-2)}${(i + 1).toString().padStart(3, "0")}`,
                  isPresent: Math.random() > 0.3
                })),
              });
            }
          }
        }
      }
    }
  }
}

function getDateRangeArray(from: string, to: string) {
  if (!from || !to) return [];
  const arr = [];
  let d = new Date(from);
  const end = new Date(to);
  while (d <= end) {
    arr.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return arr;
}

function getMonthYear(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

function getMonthYearLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
}

const PreviousAttendancePage = () => {
  const [facultyName] = useState("Dr. Jane Smith");

  // Separate filters for single and group modes
  const [singleFilters, setSingleFilters] = useState({
    singleDate: "",
    department: "",
    course: "",
    batch: "",
    semester: "",
  });
  const [groupFilters, setGroupFilters] = useState({
    fromDate: "",
    toDate: "",
    department: "",
    course: "",
    batch: "",
    semester: "",
  });

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent">("all");
  const [selectedDateInRange, setSelectedDateInRange] = useState<string | null>(null);

  // Month/year selector state
  const [selectedMonthYear, setSelectedMonthYear] = useState<string | null>(null);

  // Toggle state: "single" or "group"
  const [attendanceMode, setAttendanceMode] = useState<"single" | "group">("single");

  // For single day view sheet toggles
  const [showFN, setShowFN] = useState(false);
  const [showAN, setShowAN] = useState(false);

  const navigate = useNavigate();

  // Today's date string for max attribute
  const todayStr = new Date().toISOString().split("T")[0];

  // Date filter helpers
  const isDateRange = attendanceMode === "group" && !!groupFilters.fromDate && !!groupFilters.toDate;

  // Use correct filters based on mode
  const filters = attendanceMode === "single" ? singleFilters : groupFilters;

  // Filter records based on filters
  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const matches =
      (!filters.department || record.department === filters.department) &&
      (!filters.batch || record.batch === filters.batch) &&
      (!filters.course || record.course === filters.course) &&
      (!filters.semester || record.semester === filters.semester);

    // Date filtering
    if (attendanceMode === "group" && groupFilters.fromDate && groupFilters.toDate) {
      return (
        matches &&
        record.date >= groupFilters.fromDate &&
        record.date <= groupFilters.toDate
      );
    } else if (attendanceMode === "single" && singleFilters.singleDate) {
      return matches && record.date === singleFilters.singleDate;
    } else {
      return matches;
    }
  });

  // For date range, group by student roll number
  const getDateRangeSummary = () => {
    if (!isDateRange) return null;
    const rangeRecords = mockAttendanceRecords.filter((record) => {
      const matches =
        (!groupFilters.department || record.department === groupFilters.department) &&
        (!groupFilters.batch || record.batch === groupFilters.batch) &&
        (!groupFilters.course || record.course === groupFilters.course) &&
        (!groupFilters.semester || record.semester === groupFilters.semester) &&
        record.date >= groupFilters.fromDate &&
        record.date <= groupFilters.toDate;
      return matches;
    });

    const studentMap: Record<string, {
      name: string;
      rollNumber: string;
      fnCount: number;
      anCount: number;
      fnPresent: number;
      anPresent: number;
    }> = {};

    const uniqueDays = Array.from(new Set(rangeRecords.map(r => r.date))).sort();

    for (const record of rangeRecords) {
      for (const student of record.students) {
        if (!studentMap[student.rollNumber]) {
          studentMap[student.rollNumber] = {
            name: student.name,
            rollNumber: student.rollNumber,
            fnCount: 0,
            anCount: 0,
            fnPresent: 0,
            anPresent: 0,
          };
        }
        if (record.session === "FN") {
          studentMap[student.rollNumber].fnCount += 1;
          if (student.isPresent) studentMap[student.rollNumber].fnPresent += 1;
        } else if (record.session === "AN") {
          studentMap[student.rollNumber].anCount += 1;
          if (student.isPresent) studentMap[student.rollNumber].anPresent += 1;
        }
      }
    }

    return Object.values(studentMap).map((s) => {
      const totalSessions = (s.fnCount + s.anCount);
      const presentSessions = (s.fnPresent + s.anPresent);
      const totalDays = uniqueDays.length;
      return {
        ...s,
        totalDays,
        fnTotal: s.fnCount,
        anTotal: s.anCount,
        fnPresent: s.fnPresent,
        anPresent: s.anPresent,
        attendancePercent: totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0,
      };
    });
  };

  const getFilteredStudents = (students: AttendanceRecord["students"]) => {
    if (statusFilter === "all") return students;
    if (statusFilter === "present") return students.filter((s) => s.isPresent);
    return students.filter((s) => !s.isPresent);
  };

  const dateRangeArray = isDateRange ? getDateRangeArray(groupFilters.fromDate, groupFilters.toDate) : [];
  const monthYearOptions = useMemo(() => {
    // Get unique month-year pairs in the date range
    const set = new Set<string>();
    dateRangeArray.forEach(date => set.add(getMonthYear(date)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [dateRangeArray]);

  // Set default selectedMonthYear when date range changes
  React.useEffect(() => {
    if (monthYearOptions.length > 0) {
      setSelectedMonthYear((prev) =>
        prev && monthYearOptions.includes(prev) ? prev : monthYearOptions[0]
      );
    } else {
      setSelectedMonthYear(null);
    }
    setSelectedDateInRange(null);
  }, [groupFilters.fromDate, groupFilters.toDate, monthYearOptions.length, attendanceMode]);

  // Reset FN/AN view toggles when date or mode changes
  React.useEffect(() => {
    setShowFN(false);
    setShowAN(false);
  }, [singleFilters.singleDate, attendanceMode]);

  // Filter days for selected month/year
  const daysForSelectedMonth = useMemo(() => {
    if (!selectedMonthYear) return [];
    return dateRangeArray.filter(date => getMonthYear(date) === selectedMonthYear);
  }, [dateRangeArray, selectedMonthYear]);

  // Single day FN/AN records
  const singleDayFN = attendanceMode === "single" && singleFilters.singleDate
    ? filteredRecords.find(r => r.session === "FN")
    : null;
  const singleDayAN = attendanceMode === "single" && singleFilters.singleDate
    ? filteredRecords.find(r => r.session === "AN")
    : null;

  const recordsForSelectedDate =
    isDateRange && selectedDateInRange
      ? filteredRecords.filter((rec) => rec.date === selectedDateInRange)
      : [];

  // --- UI ---
  return (
    <>
      <Navbar userType="faculty" userName={facultyName} />
      <div className="page-container max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col items-center">
          <Button variant="outline" className="self-start mb-2" onClick={() => navigate("/faculty/attendance")}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-center">Previous Attendance Records</h1>
          <p className="text-secondary mt-2 text-center">View Previous Attendance Sheets</p>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={attendanceMode === "single" ? "default" : "outline"}
              onClick={() => {
                setAttendanceMode("single");
                setShowFN(false);
                setShowAN(false);
                setSelectedRecord(null);
                setSelectedDateInRange(null);
              }}
            >
              Single Day Attendance
            </Button>
            <Button
              variant={attendanceMode === "group" ? "default" : "outline"}
              onClick={() => {
                setAttendanceMode("group");
                setShowFN(false);
                setShowAN(false);
                setSelectedRecord(null);
                setSelectedDateInRange(null);
              }}
            >
              Overall Attendance
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {/* Filter fields */}
  
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={attendanceMode === "single" ? singleFilters.course : groupFilters.course}
                  onValueChange={(value) =>
                    attendanceMode === "single"
                      ? setSingleFilters((prev) => ({ ...prev, course: value }))
                      : setGroupFilters((prev) => ({ ...prev, course: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select
                  value={attendanceMode === "single" ? singleFilters.batch : groupFilters.batch}
                  onValueChange={(value) =>
                    attendanceMode === "single"
                      ? setSingleFilters((prev) => ({ ...prev, batch: value }))
                      : setGroupFilters((prev) => ({ ...prev, batch: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={attendanceMode === "single" ? singleFilters.department : groupFilters.department}
                  onValueChange={(value) =>
                    attendanceMode === "single"
                      ? setSingleFilters((prev) => ({ ...prev, department: value }))
                      : setGroupFilters((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={attendanceMode === "single" ? singleFilters.semester : groupFilters.semester}
                  onValueChange={(value) =>
                    attendanceMode === "single"
                      ? setSingleFilters((prev) => ({ ...prev, semester: value }))
                      : setGroupFilters((prev) => ({ ...prev, semester: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date pickers based on mode */}
              {attendanceMode === "single" ? (
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="singleDate">Date</Label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={singleFilters.singleDate}
                    max={todayStr}
                    onChange={(e) => {
                      setSingleFilters((prev) => ({
                        ...prev,
                        singleDate: e.target.value,
                      }));
                      setShowFN(false);
                      setShowAN(false);
                      setSelectedRecord(null);
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date</Label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={groupFilters.fromDate}
                      max={todayStr}
                      onChange={(e) => {
                        setGroupFilters((prev) => ({
                          ...prev,
                          fromDate: e.target.value,
                          toDate: prev.toDate && prev.toDate < e.target.value ? "" : prev.toDate,
                        }));
                        setSelectedDateInRange(null);
                        setSelectedRecord(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date</Label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={groupFilters.toDate}
                      min={groupFilters.fromDate}
                      max={todayStr}
                      onChange={(e) => {
                        setGroupFilters((prev) => ({ ...prev, toDate: e.target.value }));
                        setSelectedDateInRange(null);
                        setSelectedRecord(null);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6">
              {/* Single Day Attendance */}
              {attendanceMode === "single" ? (
                !singleFilters.singleDate ? (
                  <p className="text-secondary text-center">Please select a date to view attendance.</p>
                ) : (
                  <div className="space-y-4">
                    {!singleDayFN && !singleDayAN ? (
                      <p className="text-secondary text-center">No attendance records found for this date.</p>
                    ) : (
                      <>
                        {/* FN View Sheet Card */}
                        {singleDayFN && !showFN && (
                          <Card>
                            <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                              <div>
                                <div className="font-semibold">{singleDayFN.department} - {singleDayFN.batch}</div>
                                <div className="text-sm text-secondary">{singleDayFN.course} - Semester {singleDayFN.semester}</div>
                                <div className="text-sm text-secondary">Date: {singleDayFN.date} [FN]</div>
                              </div>
                              <div className="mt-2 md:mt-0">
                                <Button variant="outline" size="sm" onClick={() => { setShowFN(true); setShowAN(false); setSelectedRecord(null); }}>
                                  View Sheet
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {/* AN View Sheet Card */}
                        {singleDayAN && !showAN && (
                          <Card>
                            <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                              <div>
                                <div className="font-semibold">{singleDayAN.department} - {singleDayAN.batch}</div>
                                <div className="text-sm text-secondary">{singleDayAN.course} - Semester {singleDayAN.semester}</div>
                                <div className="text-sm text-secondary">Date: {singleDayAN.date} [AN]</div>
                              </div>
                              <div className="mt-2 md:mt-0">
                                <Button variant="outline" size="sm" onClick={() => { setShowAN(true); setShowFN(false); setSelectedRecord(null); }}>
                                  View Sheet
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {/* FN Attendance Sheet */}
                        {singleDayFN && showFN && (
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                <div>Attendance Sheet - {singleDayFN.department} ({singleDayFN.batch})</div>
                                <div>{singleDayFN.course} - Semester {singleDayFN.semester}</div>
                                <div>Date: {singleDayFN.date} [FN]</div>
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">Total Students:</span> {singleDayFN.students.length}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button variant="outline" className="mb-4" onClick={() => setShowFN(false)}>
                                ← Back to View Sheet
                              </Button>
                              <div className="mb-4 flex gap-2 items-center">
                                <Label>Status Filter:</Label>
                                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <table className="min-w-full border rounded">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 border-b text-left">Roll Number</th>
                                      <th className="py-2 px-4 border-b text-left">Name</th>
                                      <th className="py-2 px-4 border-b text-left">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredStudents(singleDayFN.students).map((student) => (
                                      <tr key={student.id}>
                                        <td className="py-2 px-4 border-b">{student.rollNumber}</td>
                                        <td className="py-2 px-4 border-b">{student.name}</td>
                                        <td className="py-2 px-4 border-b">
                                          {student.isPresent ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                              </svg>
                                              Present
                                            </span>
                                          ) : (
                                            <span className="text-red-600 flex items-center gap-1">
                                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                              Absent
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {getFilteredStudents(singleDayFN.students).length === 0 && (
                                  <div className="text-center text-secondary py-4">No students found for this filter.</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {/* AN Attendance Sheet */}
                        {singleDayAN && showAN && (
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                <div>Attendance Sheet - {singleDayAN.department} ({singleDayAN.batch})</div>
                                <div>{singleDayAN.course} - Semester {singleDayAN.semester}</div>
                                <div>Date: {singleDayAN.date} [AN]</div>
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">Total Students:</span> {singleDayAN.students.length}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button variant="outline" className="mb-4" onClick={() => setShowAN(false)}>
                                ← Back to View Sheet
                              </Button>
                              <div className="mb-4 flex gap-2 items-center">
                                <Label>Status Filter:</Label>
                                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <table className="min-w-full border rounded">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 border-b text-left">Roll Number</th>
                                      <th className="py-2 px-4 border-b text-left">Name</th>
                                      <th className="py-2 px-4 border-b text-left">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredStudents(singleDayAN.students).map((student) => (
                                      <tr key={student.id}>
                                        <td className="py-2 px-4 border-b">{student.rollNumber}</td>
                                        <td className="py-2 px-4 border-b">{student.name}</td>
                                        <td className="py-2 px-4 border-b">
                                          {student.isPresent ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                              </svg>
                                              Present
                                            </span>
                                          ) : (
                                            <span className="text-red-600 flex items-center gap-1">
                                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                              Absent
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {getFilteredStudents(singleDayAN.students).length === 0 && (
                                  <div className="text-center text-secondary py-4">No students found for this filter.</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                )
              ) : (
                // Group Attendance
                isDateRange ? (
                  dateRangeArray.length === 0 ? (
                    <p className="text-secondary text-center">No dates in selected range.</p>
                  ) : (
                    <div>
                      {selectedDateInRange && (
                        <div className="space-y-4 mb-4">
                          {recordsForSelectedDate.length === 0 ? (
                            <p className="text-secondary text-center">No records for this date.</p>
                          ) : (
                            recordsForSelectedDate.map((record) => (
                              <Card
                                key={record.id}
                                className={`cursor-pointer border ${selectedRecord?.id === record.id ? "border-primary" : ""}`}
                                onClick={() => setSelectedRecord(record)}
                              >
                                <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                                  <div>
                                    <div className="font-semibold">{record.department} - {record.batch}</div>
                                    <div className="text-sm text-secondary">{record.course}  - Semester {record.semester}</div>
                                    <div className="text-sm text-secondary">Date: {record.date}</div>
                                  </div>
                                  <div className="mt-2 md:mt-0">
                                    <Button variant="outline" size="sm">
                                      View Sheet
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <p className="text-secondary text-center">No records found for the selected filters.</p>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group Attendance Sheet */}
        {attendanceMode === "group" && isDateRange && !selectedRecord && (
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance Sheet (Date Range: {groupFilters.fromDate} to {groupFilters.toDate})
              </CardTitle>
              <CardDescription>
                <span className="font-semibold">Combined attendance for all sessions in given range</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Roll Number</th>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Days</th>
                    <th className="py-2 px-4 border-b text-left">FN     Present / Total</th>
                    <th className="py-2 px-4 border-b text-left">AN Present / Total</th>
                    <th className="py-2 px-4 border-b text-left">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {getDateRangeSummary()?.map((student) => (
                    <tr key={student.rollNumber}>
                      <td className="py-2 px-4 border-b">{student.rollNumber}</td>
                      <td className="py-2 px-4 border-b">{student.name}</td>
                      <td className="py-2 px-4 border-b">{student.totalDays}</td>
                      <td className="py-2 px-4 border-b">{student.fnPresent} / {student.fnTotal}</td>
                      <td className="py-2 px-4 border-b">{student.anPresent} / {student.anTotal}</td>
                      <td className="py-2 px-4 border-b">{student.attendancePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getDateRangeSummary()?.length === 0 && (
                <div className="text-center text-secondary py-4">No students found for this filter.</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Single Record Attendance Sheet */}
        {selectedRecord && (
          <Card>
            <CardHeader>
              <CardTitle>
                <div>Attendance Sheet - {selectedRecord.department} ({selectedRecord.batch})</div> <br />
                <div>{selectedRecord.course} - Semester {selectedRecord.semester}</div> <br />
                <div>Date : {selectedRecord.date} [{selectedRecord.session}]</div>
                <br />
              </CardTitle>
              <CardDescription>
                <span className="font-semibold">Total Students:</span> {selectedRecord.students.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="mb-4" onClick={() => setSelectedRecord(null)}>
                ← Back to Records
              </Button>
              <div className="mb-4 flex gap-2 items-center">
                <Label>Status Filter:</Label>
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <table className="min-w-full border rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Roll Number</th>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredStudents(selectedRecord.students).map((student) => (
                      <tr key={student.id}>
                        <td className="py-2 px-4 border-b">{student.rollNumber}</td>
                        <td className="py-2 px-4 border-b">{student.name}</td>
                        <td className="py-2 px-4 border-b">
                          {student.isPresent ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Present
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Absent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredStudents(selectedRecord.students).length === 0 && (
                  <div className="text-center text-secondary py-4">No students found for this filter.</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default PreviousAttendancePage;