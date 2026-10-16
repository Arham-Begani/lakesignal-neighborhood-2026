# LakeSignal

LakeSignal is a local-first browser prototype that turns a resident's lake observation into a structured maintenance report. It was built from scratch during the Neighborhood Hacks 2026 hacking window (October 16–23, 2026).

## What it does

- Records a named waterbody, observation date, precise landmark, visible concern, and first-hand description.
- Shows a live evidence checklist and validates required fields.
- Produces a copyable/downloadable report that distinguishes observations from diagnoses.
- Keeps the draft in browser storage; it does not send data to a server or file a complaint.
- Links residents to BBMP's official Lake Monitoring System, which points to Sahaaya 2.0 for maintenance grievances.
- Includes a **fictional, explicitly labeled** example solely for testing. It must never be sent as a real complaint.

## Run

Open `index.html` in any modern browser. No build step or account is required.

## Problem evidence

An [IISc assessment of Bengaluru lakes](https://wgbis.ces.iisc.ac.in/biodiversity/pubs/ETR/ETR101/results.html) documented serious historical pollution pressures. It is evidence of a broader problem, not proof of any current incident at a specific lake. The [BBMP Lake Monitoring System](https://lms.bbmpgov.in/lake) lists Sahaaya 2.0 as a way for citizens to lodge lake-maintenance complaints.

## Built with and disclosure

HTML, CSS, and vanilla JavaScript, with `localStorage` for draft persistence. AI coding assistance was used to implement and review the prototype. No prior LakeAlive/Kere source code or design was copied into this project. The idea is informed by earlier work on lake-awareness projects, but all code, design, and text here were created for Neighborhood Hacks.

## Limits and next steps

This is a report-preparation tool, not a water-quality sensor or government service. Visual signs cannot determine contamination or cause. Future work could add offline image attachments, multilingual guidance, and a way to track reports after an official submission, with consent and safeguards for location/privacy.
