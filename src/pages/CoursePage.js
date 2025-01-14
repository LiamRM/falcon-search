import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import qs from "qs";
import styled from "styled-components";
import Section from "../components/Section";
import { parseDate } from "../utils";

import * as actions from "../redux/modules/wishlist";
// Import major progressions
import { progressions } from "../majorProgressions"; // eslint-disable-line no-unused-vars

function CoursePage({ year, semester, location }) {
  const { school, subject, courseid } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://schedge.a1liu.com/${year}/${semester}/${school}/${subject}?full=true`
        );
        if (!response.ok) {
          // handle invalid search parameters
          return;
        }
        const data = await response.json();
        setCourseData(
          () => data.filter((course) => course.deptCourseId === courseid)[0]
        );
        setLoading(() => false);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [year, semester, courseid, school, subject]);

  return (
    <div>
      {loading && (
        <>
          <span>Loading...</span>
          <ColorHeader>
            <CourseHeader>
              <Link to="/" style={{ textDecoration: "none" }}>
                <img src="./img/go-back.svg" alt="Go back" id="backButton" />
              </Link>
            </CourseHeader>
          </ColorHeader>
        </>
      )}
      {!loading && (
        <>
          <ColorHeader>
            <CourseHeader>
              <Link
                to={`/subject?school=${school}&subject=${subject}`}
                style={{ textDecoration: "none" }}
              >
                <img src="./img/go-back.svg" alt="Go back" id="backButton" />
              </Link>
              <div>
                <div id="titleDepartment">
                  {subject}-{school}
                </div>
                <div id="titleName">{courseData.name}</div>
              </div>
            </CourseHeader>
          </ColorHeader>
          {/* Handle course description here if all sections have the same one */}
          <SectionsDescription>
            {courseData.description}
            {courseData.sections.every(
              (section) => section.notes === courseData.sections[0].notes
            ) && (
              <>
                <br />
                <br />
                {courseData.sections[0].notes}
              </>
            )}
          </SectionsDescription>
          {courseData.sections.length > 1 && (
            <SectionsHeader>Sections</SectionsHeader>
          )}
          <div>
            {courseData.sections.map((section, i) => {
              const sortedSectionMeetings = section.meetings
                ? section.meetings.sort(
                    (a, b) =>
                      parseDate(a.beginDate).getDay() -
                      parseDate(b.beginDate).getDay()
                  )
                : [];
              return (
                <Section
                  key={i}
                  section={section}
                  sortedSectionMeetings={sortedSectionMeetings}
                  courseData={courseData}
                  year={year}
                  semester={semester}
                  lastSection={i === courseData.sections.length - 1}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

CoursePage.propTypes = {
  year: PropTypes.number.isRequired,
  semester: PropTypes.string.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  wishlist: PropTypes.arrayOf(PropTypes.object).isRequired,
  wishlistCourse: PropTypes.func.isRequired,
};

const ColorHeader = styled.div`
  width: 100vw;
  /* height: calc(14vmin + 8rem); */
  padding-top: 6rem;
  margin-top: -6rem;
  background: linear-gradient(
    167deg,
    var(--purpleMain) 21%,
    #712991 60%,
    rgba(135, 37, 144, 1) 82%
  );
  position: relative;
  display: flex;
  align-items: flex-end;
  @media (max-width: 1000px) {
    padding-top: 5rem;
  }
`;

const CourseHeader = styled.div`
  width: 90vw;
  margin-left: 5vw;
  background-color: var(--grey100);
  color: var(--grey800);
  padding: 3vmin 4vmin 10vmin 4%;
  border-top-left-radius: 0.8rem;
  border-top-right-radius: 0.8rem;
  box-shadow: 0 -5px 5px rgba(0, 0, 0, 0.15);
  margin-bottom: calc(-3vh - 5vmin);

  & #backButton {
    position: absolute;
    z-index: 2;
    top: 2.5vmin;
    left: 5vw;
    height: 2.5rem;
    opacity: 0.7;
    transition: 0.15s;
  }

  & #backButton:hover {
    opacity: 1;
  }

  & #titleDepartment {
    font-size: calc(1vmin + 0.7rem);
    margin: 0 0 -0.5vmin 0.3vmin;
    font-family: var(--grey200);
  }

  & #titleName {
    font-size: calc(2.2vmin + 1.4rem);
    font-weight: bold;
  }
`;

const SectionsDescription = styled.div`
  padding: 1.8vmin 2.8vmin;
  font-size: 1.2rem;
  line-height: 1.65rem;
  width: 73%;
  margin-left: 9%;
  color: var(--grey800);
  position: relative;
  @media (max-width: 1000px) {
    margin-top: calc(12vmin);
  }
`;

const SectionsHeader = styled.div`
  font-weight: bold;
  text-align: center;
  font-size: calc(1.2vmin + 1rem);
  padding: 2vmin;
  color: var(--grey800);
  margin-top: calc(2vmin + 1rem);
`;

const mapStateToProps = (state, props) => ({
  wishlist: state.wishlist[props.semester + props.year] || [],
  scheduled: state.scheduled[props.semester + props.year] || [],
});

export default connect(mapStateToProps, actions)(CoursePage);
