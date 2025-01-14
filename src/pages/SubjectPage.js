import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import PropTypes from "prop-types";
import qs from "qs";
import styled from "styled-components";
import { grey } from "@material-ui/core/colors";

import { findSchool, styleStatus, checkStatus } from "../utils";

export default function SubjectPage({ year, semester, location }) {
  const { school, subject } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  const [courseList, setCourseList] = useState({ loading: true, data: [] });
  const [departmentList, setDepartmentList] = useState({
    loading: true,
    data: {},
  });
  const [schoolList, setSchoolList] = useState({ loading: true, data: {} });

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://schedge.a1liu.com/${year}/${semester}/${school}/${subject}`
        );
        if (!response.ok) {
          // handle invalid search parameters
          return;
        }
        const data = await response.json();
        const sortedData = data.sort((a, b) => a.deptCourseId - b.deptCourseId);
        setCourseList(() => ({ loading: false, data: sortedData }));
      } catch (error) {
        console.error(error);
      }
    })();
    (async () => {
      try {
        const response = await fetch("https://schedge.a1liu.com/subjects");
        if (!response.ok) {
          // handle invalid search parameters
          return;
        }
        const data = await response.json();
        setDepartmentList(() => ({ loading: false, data }));
      } catch (error) {
        console.error(error);
      }
    })();

    (async () => {
      try {
        const response = await fetch("https://schedge.a1liu.com/schools");
        if (!response.ok) {
          // handle invalid search parameters
          return;
        }
        const data = await response.json();
        setSchoolList(() => ({ loading: false, data }));
      } catch (error) {
        console.error(error);
      }
    })();
  }, [year, semester, school, subject]);

  return (
    <PageContainer>
      <HeaderBackground></HeaderBackground>
      {courseList.loading && schoolList.loading && departmentList.loading && (
        <span></span>
      )}
      {!(
        courseList.loading ||
        schoolList.loading ||
        departmentList.loading
      ) && (
        <div>
          <DepartmentHeader>
            <Link
              to={{
                pathname: "/school",
                search: `?school=${school}`,
                state: {
                  schoolName: schoolList.data[school]
                    ? schoolList.data[school].name
                    : findSchool(school),
                },
              }}
              style={{ textDecoration: "none" }}
            >
              <SchoolName>
                {schoolList.data[school]
                  ? schoolList.data[school].name
                  : school}
              </SchoolName>
            </Link>

            <DepartmentName>
              {departmentList.data[school][subject].name
                ? departmentList.data[school][subject].name
                : ""}
            </DepartmentName>
          </DepartmentHeader>
          <CourseContainer>
            {courseList.data.map((course, i) => (
              <Link
                to={{
                  pathname: "/course",
                  search: `?&school=${course.subjectCode.school}&subject=${course.subjectCode.code}&courseid=${course.deptCourseId}`,
                }}
                key={i}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Course>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h4>
                      {course.subjectCode.code}-{course.subjectCode.school}{" "}
                      {course.deptCourseId}
                    </h4>
                    {/* Display overall course status */}
                    <span
                      style={{
                        color: styleStatus(checkStatus(course.sections)),
                      }}
                    >
                      {checkStatus(course.sections)}
                    </span>
                  </div>
                  <h3>{course.name}</h3>
                  <p>{course.sections.length} Sections</p>
                </Course>
              </Link>
            ))}
          </CourseContainer>
        </div>
      )}
    </PageContainer>
  );
}

SubjectPage.propTypes = {
  year: PropTypes.number.isRequired,
  semester: PropTypes.string.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
};

const PageContainer = styled.div`
  background-color: ${grey[200]};
  width: 100vw;
  min-height: 100vh;
`;

const HeaderBackground = styled.div`
  width: 100vw;
  height: 2rem;
  background-color: ${grey[200]};
`;

const DepartmentHeader = styled.div`
  margin: 2vmin 2vmin 4vmin 4vmax;
`;

const SchoolName = styled.div`
  color: ${grey[800]};
  font-size: 1.4rem;
`;

const DepartmentName = styled.div`
  color: ${grey[900]};
  font-weight: bold;
  font-size: 2.6rem;
  margin-top: -0.1rem;
`;

const CourseContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 85vw;
  margin: 0 auto;
`;

const Course = styled.div`
  padding: 0.75vmax 3vmin;
  word-break: break-word;
  width: 60vmin;
  min-height: 5vmax;
  background-color: ${grey[100]};
  margin: 1vmax;
  border-radius: 0.3rem;
  border-bottom: 0.2rem solid ${grey[300]};
  @media (max-width: 1000px) {
    width: 38vmin;
  }

  &:hover {
    border-color: ${grey[400]};
  }

  & > h4 {
    color: ${grey[600]};
  }
  & > p {
    color: ${grey[700]};
  }
`;
