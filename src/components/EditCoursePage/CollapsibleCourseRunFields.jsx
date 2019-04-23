import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { Field, FieldArray, submit } from 'redux-form';
import { Collapsible } from '@edx/paragon';
import { connect } from 'react-redux';

import ButtonToolbar from '../ButtonToolbar';
import FieldLabel from '../FieldLabel';
import Pill from '../Pill';
import { PUBLISHED } from '../../data/constants';
import RenderInputTextField from '../RenderInputTextField';
import RenderSelectField from '../RenderSelectField';
import StaffList from '../StaffList';
import TranscriptLanguage from './TranscriptLanguage';


const formatCourseRunTitle = (courseRun) => {
  if (courseRun) {
    const labelItems = [];
    if (courseRun.start) {
      labelItems.push(moment(courseRun.start).format('MMM Do YYYY'));
    }
    if (courseRun.pacing_type) {
      labelItems.push(courseRun.pacing_type.split('_').map(pacingType =>
        pacingType.charAt(0).toUpperCase() + pacingType.slice(1)).join(' '));
    }
    return (
      <div className="course-run-label">
        <span>{`Course run starting on ${labelItems.join(' - ')}`}</span>
        {/*
          TODO: After we have a way of determining if the course run has been edited, that should
          be added into the list of statuses being passed into the Pill component.
        */}
        <Pill statuses={[courseRun.status]} />
        <div className="course-run-studio-url">
          {'Studio URL - '}
          <a href={`${process.env.STUDIO_BASE_URL}/course/${courseRun.key}`}>
            {`${courseRun.key}`}
          </a>
        </div>
        {courseRun.marketing_url ?
          <div className="course-run-preview-url">
            {'Preview URL - '}
            <a href={`${courseRun.marketing_url}`}>
              {'View about page'}
            </a>
          </div> : null}
      </div>
    );
  }
  return (
    <div>
      <span>Your new course run</span>
    </div>
  );
};

const getDateString = date => (date ? moment(date).format('YYYY-MM-DD') : '');

export const BaseCollapsibleCourseRunFields = ({
  fields,
  courseRuns,
  languageOptions,
  pacingTypeOptions,
  courseInReview,
  handleCourseRunSubmit,
  dispatch,
  formId,
  ...passedProps
}) => (
  <div>
    {fields.map((courseRun, index) => (
      <Collapsible
        title={formatCourseRunTitle(courseRuns[index])}
        key={`collapsible-run-${courseRun}`}
        iconId={`collapsible-icon-${courseRun}`}
      >
        <Field
          name={`${courseRun}.start`}
          type="date"
          component={RenderInputTextField}
          format={value => getDateString(value)}
          label={<FieldLabel text="Start date" required requiredForSubmit />}
          placeholder="mm/dd/yyyy"
          required
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.end`}
          type="date"
          component={RenderInputTextField}
          format={value => getDateString(value)}
          normalize={value => moment(value).toISOString()}
          label={<FieldLabel text="End date" required requiredForSubmit />}
          placeholder="mm/dd/yyyy"
          required
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.go_live_date`}
          type="date"
          component={RenderInputTextField}
          format={value => getDateString(value)}
          normalize={value => moment(value).toISOString()}
          label={<FieldLabel text="Go Live date" />}
          placeholder="mm/dd/yyyy"
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.min_effort`}
          type="number"
          component={RenderInputTextField}
          label={<FieldLabel text="Minimum effort" requiredForSubmit />}
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.max_effort`}
          type="number"
          component={RenderInputTextField}
          label={<FieldLabel text="Maximum effort" requiredForSubmit />}
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.pacing_type`}
          type="text"
          component={RenderSelectField}
          options={pacingTypeOptions}
          label={<FieldLabel text="Course pacing" requiredForSubmit />}
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.content_language`}
          type="text"
          component={RenderSelectField}
          options={languageOptions}
          label={<FieldLabel text="Content language" requiredForSubmit />}
          disabled={courseInReview}
        />
        <FieldLabel text="Transcript languages" className="mb-2" requiredForSubmit />
        <FieldArray
          name={`${courseRun}.transcript_languages`}
          component={TranscriptLanguage}
          languageOptions={languageOptions}
          disabled={courseInReview}
        />
        <Field
          name={`${courseRun}.weeks_to_complete`}
          type="number"
          component={RenderInputTextField}
          label={<FieldLabel text="Length" requiredForSubmit />}
          disabled={courseInReview}
        />
        <FieldLabel text="Staff" className="mb-2" requiredForSubmit />
        <Field
          name={`${courseRun}.staff`}
          component={StaffList}
          disabled={courseInReview}
          courseRunKey={courseRuns[index].key}
          {...passedProps}
        />
        <ButtonToolbar>
          <button
            type="submit"
            className="btn btn-primary form-submit-btn"
            disabled={courseInReview}
            onClick={(event) => {
              /*
              *  Manually check the form for validity so that we can pass the targeted course run up
              *  through the handler and redux-form's submit if it passes validation. If validation
              *  fails, report the form issues back without triggering submission.
              */
              event.preventDefault();
              const form = document.getElementById(formId);
              if (form.checkValidity()) {
                handleCourseRunSubmit(courseRuns[index]);
                dispatch(submit(formId));
              } else {
                form.reportValidity();
              }
            }}
          >
            {courseRuns[index].status === PUBLISHED ? (
              <span>Publish</span>
            ) : (
              <span>Submit for Review</span>
            )}
          </button>
        </ButtonToolbar>
      </Collapsible>
    ))}
  </div>
);

BaseCollapsibleCourseRunFields.propTypes = {
  fields: PropTypes.shape({
    remove: PropTypes.func,
  }).isRequired,
  languageOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  pacingTypeOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  courseRuns: PropTypes.arrayOf(PropTypes.shape({})),
  courseInReview: PropTypes.bool,
  handleCourseRunSubmit: PropTypes.func.isRequired,
  dispatch: PropTypes.func,
  formId: PropTypes.string.isRequired,
  passedProps: PropTypes.shape({}),
};

BaseCollapsibleCourseRunFields.defaultProps = {
  courseRuns: [],
  courseInReview: false,
  dispatch: () => {},
  passedProps: {},
};

export default connect()(BaseCollapsibleCourseRunFields);