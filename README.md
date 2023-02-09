## IT-314 ##
## Group-22 ## 
## Lab_Session-2 ##

 ## <pre> *Needs for the Placement Cell* </pre>

* **Efficient interaction** <br>
The system should facilitate smooth interaction between all students and companies, making the placement process more efficient and convenient.

* **Student information management** <br>
The system should provide a centralized platform for storing and managing student information such as grades, courses taken, and endorsements from faculty.

* **Secure access for companies** <br>
Companies should be able to access the system securely through a login ID, allowing them to review student credentials remotely even before they reach the campus. 
Companies should be able to see the information of those students who have registered for that company and not yet placed.

* **Job postings and scheduling** <br>
Companies should be able to post job opportunities and schedule recruiting drives, making it easier for students to apply and stay informed. 

* **Student preparation** <br>
Students should have access to information about companies and should be able to gather further information through company websites and employer review sites. This will enable them to be well-prepared for the interview process.

* **Improved data analysis** <br>
The system should enable the placement cell to easily gather data and spot trends, making it easier to track the success of the placement process and identify areas for improvement.

* **Student Performance** <br>
Students should be able to see his/her performance of the interviews that (s)he has given and track all the interview rounds that (s)he has given.

* **Student Data Verification**<br>
After filling out the registration form, students should not be able to apply for the company until the admin approves the registration.

----
## <pre> *Features of the Placement Cell* </pre>

* **Student information management**<br>
A centralized platform for storing and managing student information such as grades, courses taken, and endorsements from faculty.

* **Secure company access**<br>
A secure login system for companies to access the student information and job postings.

* **Job postings and scheduling**<br>
An online platform for companies to post job opportunities and schedule recruiting drives allowing them to ask their needs about roles.

* **Online recruitment process**<br>
The ability for students to apply for job opportunities and receive updates throughout the recruitment process.

* **Company profile creation**<br>
A platform for companies to create company profiles and gather information about the students who have registered for that particular company.

* **Data analysis**<br>
A system for tracking and analyzing student information and recruitment trends, allowing for the placement cell to spot trends and identify areas for improvement.

* **User-friendly interface**<br>
An intuitive and user-friendly interface for easy navigation and use by all stakeholders.

* **Resume builder**<br>
A tool for students to create and manage their resumes, which can be made available to the recruiters.

* **Real-time notifications**<br>
A real-time notification system to keep students and recruiters updated on the latest developments throughout the recruitment process.

* **Feedback system**<br>
A system for collecting and analyzing feedback from students and recruiters, which can be used to continuously improve the placement process.

* **Application Timing**<br>
Students must register or deregister for the company in a limited time which is specified by the company.

* **Criterion**<br>
Companies should be able to add the criteria based on their needs e.g. cpi should be greater than 7 so the students who come under the criteria of company can easily register for it.

* **Company Information**<br>
Students will be able to see all companies' details that are going to visit the campus for recruitment.

* **Company filters**<br>
Students should be able to filter the companies based on their requirements like roles in the company, location of the job etc.
----
## <pre> Functional Requirements </pre> ##
- It should be able to manage and store all the student information.  
- There should be a registration system for the companies through which they register themselves and get access to students information and placement cell.
- It should be able to schedule the interviews and placement process like tests etc, according to the students schedule .
- Easy access for companies to student information.
- Students should be able to register and deregister for various companies.
- Criterias (such as CPI limit) for company registration can be set easily on the system.
- students should not be able to apply for the company until the admin approves the registration.
- Students are notified when new companies come on campus for the recruitment process.
- The registration opening time and closing time for a company can be set(time limit for registration of 24 hours can be set).
- Company can create its profile and add the information about job requirements, posting and package.
- Students who have applied to various companies receive their performance analysis based on the rounds they have successfully completed till the date.
- Resume builder helps and guides the students to properly build their resumes.
- Real time notifications/mails keeps the recruitment process easy for everyone.
- Contact details about the placement cell and their members are provided on the site. 
- Students should be able to filter the companies according to their eligibility and interest.
- There should be a feedback system for students to know user requirements.

## <pre> Non-Functional Requirements  </pre> ##

1. Authentication - While registering for the company the system/admin must authorize and validate the student credentials.

2. Scalability - The system will be used by a huge number of student as well as companies, so it must adapt to handle such a high number of users

3. Reliability
  - The database must be kept up to date so that it doesn't display companies which are not currently recruiting.
 -   This will ensure that the students can only apply for the companies that are currently recruiting and those for which the students are eligible .
    
4. Maintainability 
The web application should have the capability of modifications and updates so that the technology used does not get outdated too quickly
It can be easily updated even if the developer team of the website changes after the deployment of final product

5. Compatibility - The website should be able to run on latest versions of browsers and some older ones. Also it should be accessible through different devices such as mobile,laptop,tablet,etc.

6. Usability - The UI/UX of the website should be simple yet elegant so that students can filter companies according to the choice and perform other actions easily, without any special training.User comfort and easy interaction with the website should be ensured.

7. Accuracy - The information that is recorded about the companies and the students that are registered for particular companies must be accurate, reliable, and consistent.

8. Credentials of the user should not leak in data breach anyway as it is a privacy concern.

 
## <pre> **Identification of Model** </pre>

### Here we have chosen an Iterative Waterfall Model. 
1. Reason why we have selected: 
* Requirements and needs are mostly the same , as time being there will not be major changes in that.
* If at any phase there is something that needs to be changed , we can give feedback.
* After Deployment of a particular version , if required to do some changes then follow the same iteration. 

2. Reason for Rejection of another suitable model: 
* Incremental Model: We don’t have to make different modules and work according to that and release that. 
* Spiral Model: In that major focus is on risk management. 



